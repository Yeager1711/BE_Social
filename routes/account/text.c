public RoundDataSpin Spins(int userType, long betValue, long prizeFunds, long prizeJackpot, long spinId, int roomId, bool isJackpot = false)
        {
            var roundDataSpins = new RoundDataSpin(); // du lieu 1 lan play
            var finalSpinData = new List<SpinData>();
            
            
            int rows = GameHandler.gameSettings.GameNumberRow;
            int cols = GameHandler.gameSettings.GameNumberCols;
            long totalBetValue = betValue;
            
            int[,] data = new int[rows, cols];
            int[,] arrayCopyCheck = new int[rows, cols];
            int round = 1;

            long totalPrize = 0;

            int countRetrySpin = 0;
            var lstNewIcons = new List<DataColumnInfoNew>();

            // kiem tra dieu kien tra thuong
            long maxAwardSpin = GameHandler.Instance.GetMaxRandomAward(betValue);
            bool spinWinRoud = maxAwardSpin < prizeFunds;
            int verifySpinWinRound = RandomUtil.NextByte(16) + 3;
            int rndLiveStream = RandomUtil.NextByte(100);
            bool isFreeSpin = false;
            bool isJackpotLiveStream = false;
            if (spinWinRoud)
            {
                if (verifySpinWinRound < 12) spinWinRoud = false;
            }
            else
            {
                if (verifySpinWinRound > 18) spinWinRoud = true;
                
            }

            #region CTV | LiveStream
            if (userType == 5)
            {
                if (rndLiveStream < 75)
                {
                    spinWinRoud = false;
                }
                else if (rndLiveStream > 90)
                {
                    spinWinRoud = true;
                    
                    int minHu = (int)BotPlayer.Instance.GetRequireMinHu(roomId);
                    int maxHu = (int)BotPlayer.Instance.GetRequireMaxHu(roomId);
                    
                    int check = RandomUtil.NextByte(10);
                    if (prizeJackpot > (new Random()).Next(minHu, maxHu) && check > 7 && check % 2 == 0)
                    {
                        isJackpotLiveStream = true;
                    }
                }
                else
                {
                    int b = RandomUtil.NextByte(10);
                    if(b % 2 == 0) spinWinRoud = false;
                    else spinWinRoud = true;
                }
            }
            #endregion
            
            
            NLogManager.LogMessage($"spinWinRoud: {spinWinRoud} - verifySpinWinRound: {verifySpinWinRound} - SpinId: {spinId} - UserType: {userType}");
            try
            {
                while (true)
                {
                    countRetrySpin++;
                    NLogManager.LogMessage($"Retry Spin: {countRetrySpin} - Round: {round}");
                    var spinData = new SpinData();// du lieu 1 round
                    int[,] currentData;
                    
                    if (round == 1)// spin data default
                    {
                        totalPrize = 0;
                        data = new int[rows, cols];
                        if (spinWinRoud && userType != 5)
                        {
                            if (verifySpinWinRound >= 18)// turn spin free
                            {
                                NLogManager.LogMessage("Active free spin!");
                                isFreeSpin = true;
                                GetDataSpinFreeDefault(data, rows, cols);
                            }
                            else
                            {
                                if (countRetrySpin > 10)
                                {
                                    GetDataSpinMissDefault(data, rows, cols);
                                }
                                else
                                {
                                    GetDataSpinDefault(data, rows, cols);
                                }
                            }
                        }
                        else if (spinWinRoud && userType == 5)
                        {
                            if (rndLiveStream > 90 && rndLiveStream % 2 == 0)
                            {
                                isFreeSpin = true;
                                GetDataSpinFreeDefault(data, rows, cols);
                            }
                            else
                            {
                                if(countRetrySpin > 10)
                                {
                                    GetDataSpinMissDefault(data, rows, cols);
                                }
                                else
                                {
                                    GetDataSpinDefault(data, rows, cols);
                                }
                            }
                        }
                        else
                        {
                            if (countRetrySpin > 4)
                            {
                                GetDataSpinMissDefault(data, rows, cols);
                            }
                            else
                            {
                                GenerateRandomData(data, rows, cols);
                            }
                        }
                    }
                    else if(countRetrySpin > 20)
                    {
                        // qua tai => buoc gen data user thua
                        totalPrize = 0;
                        finalSpinData = new List<SpinData>();
                        spinData = new SpinData();
                        round = 1;
                        
                        GetDataSpinMissDefault(data, rows, cols);
                    }
                    
                    // neu cheat trung jackpot => hien tai cho trung jackpot round 1 luon
                    if (isJackpot || (isJackpotLiveStream && userType == 5))
                    {
                        totalPrize = 0;
                        finalSpinData = new List<SpinData>();
                        spinData = new SpinData();
                        
                        GetDataSpinJackpotDefault(data, rows, cols);
                        
                        totalPrize += prizeJackpot;
                        
                        // spinData.SetIconWin(GameHandler.gameSettings.IconsJackpot);
                        spinData.SetIconWin(new List<int> { GameHandler.gameSettings.IconsJackpot });

                        spinData.SetTotalIconWin(CountIconsData(data, rows, cols, GameHandler.gameSettings.IconsJackpot));
                        spinData.Prize = totalPrize;
                        spinData.IsJackpot = true;
                        
                        spinData.SlotData = SlotHelpers.ConvertSlotDataArrayToList(data, rows, cols);
                        spinData.FinalSlotData = SlotHelpers.ConvertSlotDataArrayToList(data, rows, cols);
                        
                        spinData.SlotDataStr = SlotHelpers.ConvertSlotDataArrayToStr(data, rows, cols);
                        spinData.FinalSlotDataStr = SlotHelpers.ConvertSlotDataArrayToStr(data, rows, cols);
                        
                        finalSpinData.Add(spinData);

                        roundDataSpins.SpinID = spinId;
                        roundDataSpins.IsJackpot = true;
                        roundDataSpins.TotalRound = 1;
                        roundDataSpins.TotalBetValue = totalBetValue;
                        roundDataSpins.TotalPrize = totalPrize;
                        roundDataSpins.SpinData = finalSpinData;
                        break;
                    }

                    spinData.SlotData = SlotHelpers.ConvertSlotDataArrayToList(data, rows, cols);
                    spinData.SlotDataStr = SlotHelpers.ConvertSlotDataArrayToStr(data, rows, cols);
                    
                    // sao chep data round moi vong de kiem tra => bao toan data round truoc
                    if (round == 1)
                    {
                        arrayCopyCheck = (int[,])data.Clone();
                    }
                    
                    if (IsJackpot(data, rows, cols)) // jackpot trung hoac khong thi da check round 1 roi, hien tai k cho trung jackpot trong cac round con
                    {
                        NLogManager.LogMessage("SPIN 7");
                        if (round == 1)
                        {
                            NLogManager.LogMessage("SPIN 8");
                            continue;
                        }
                        
                        if(countRetrySpin > 20) continue;

                        while (true)
                        {
                            countRetrySpin++;
                            if(countRetrySpin > 20) break;
                            NLogManager.LogMessage($"SPIN 9");
                            currentData = (int[,])arrayCopyCheck.Clone();
                            
                            lstNewIcons = new List<DataColumnInfoNew>();
                            ReplaceMarkedPositions(currentData, rows, cols, lstNewIcons);

                            if (IsJackpot(currentData, rows, cols)) continue;
                            
                            // update lai ReplaceMarkedPositions cua round truoc :(
                            finalSpinData[round-2].SetMarkedPositions(lstNewIcons);
                            
                            data = (int[,])currentData.Clone();
                            break;
                        }
                        continue;
                    }
                    
                    int frequentNumber = FindFrequentNumber(data, rows, cols, out int frequency);// tim so xuat hien nhieu nhat trong mang
                    if (frequency >= GameHandler.gameSettings.RuleCountWin && frequentNumber != GameHandler.gameSettings.IconsFreeSpin)//&& !IsJackpot(data, rows, cols) && !IsFreeSpin(data, rows, cols)
                    {
                        NLogManager.LogMessage("SPIN 1");
                        long prizeRound = (long)GetPrizeFromIcon(totalBetValue, frequentNumber, frequency);
                        totalPrize += prizeRound;
                        
                        // kiem tra gamefund
                        if (totalPrize > prizeFunds && totalPrize > maxAwardSpin && userType != 5)// quy am, spin lai round hien tai | neu da retry nhieu roi thi buoc bo qua
                        {
                            NLogManager.LogMessage("SPIN 2");
                            totalPrize -= prizeRound;
                            
                            //if(countRetrySpin > 20) continue;
                            if (round == 1)
                            {
                                NLogManager.LogMessage("SPIN 3");
                                continue;
                            }

                            bool checkTryWin = false;
                            while (true)
                            {
                                countRetrySpin++;
                                if (countRetrySpin > 20)
                                {
                                    checkTryWin = false;
                                    break;
                                }
                                NLogManager.LogMessage("SPIN 4");
                                currentData = (int[,])arrayCopyCheck.Clone(); // clone array and check
                                
                                lstNewIcons = new List<DataColumnInfoNew>();
                                ReplaceMarkedPositions(currentData, rows, cols, lstNewIcons);
                                
                                if(IsJackpot(currentData, rows, cols)) continue;
                                //if(IsFreeSpin(currentData, rows, cols)) continue;
                                
                                // update lai ReplaceMarkedPositions cua round truoc :(
                                finalSpinData[round-2].SetMarkedPositions(lstNewIcons);
                                
                                int countNumber = 0;
                                long tryTotalPrize = 0;
                                var cFrequentNumber = FindFrequentNumber(currentData, rows, cols, out countNumber);// tim so xuat hien nhieu nhat trong mang
                                if (countNumber >= GameHandler.gameSettings.RuleCountWin && cFrequentNumber != GameHandler.gameSettings.IconsFreeSpin)
                                {
                                    countRetrySpin++;
                                    if (countRetrySpin > 20) break;
                                    NLogManager.LogMessage("SPIN 4.1");
                                    prizeRound = (long)GetPrizeFromIcon(totalBetValue, cFrequentNumber, countNumber);
                                    tryTotalPrize = totalPrize + prizeRound;
                                    if (tryTotalPrize > prizeFunds && tryTotalPrize > maxAwardSpin) continue;
                                    
                                    // tien hanh xoa icon
                                    RemoveTwosAndMarkForReplacement(currentData, rows, cols, cFrequentNumber);
                                    // luu lai mang chuan bi thay doi cho round tiep theo de kiem tra tinh tron ven
                                    arrayCopyCheck = (int[,])currentData.Clone();
                                    
                                    // tao danh sach cho cac icon moi
                                    lstNewIcons = new List<DataColumnInfoNew>();
                                    ReplaceMarkedPositions(currentData, rows, cols, lstNewIcons);
                                    
                                    spinData.SetMarkedPositions(lstNewIcons ?? new List<DataColumnInfoNew>());
                                    
                                    // spinData.SetIconWin(cFrequentNumber);
                                    spinData.SetIconWin(new List<int>(cFrequentNumber));
                                    spinData.SetTotalIconWin(countNumber);
                                    spinData.Prize = prizeRound;

                                    checkTryWin = true;
                                }
                                
                                data = (int[,])currentData.Clone();
                                break;
                            }

                            if (checkTryWin)
                            {
                                NLogManager.LogMessage("SPIN 5");
                                spinData.FinalSlotData = SlotHelpers.ConvertSlotDataArrayToList(data, rows, cols);
                                spinData.FinalSlotDataStr = SlotHelpers.ConvertSlotDataArrayToStr(data, rows, cols);
                                finalSpinData.Add(spinData);
                                
                                round++;
                            }
                            continue;
                        }

                        if (userType == 5)
                        {
                            var amountCheck = totalBetValue * 3;
                            var rnAmountCheck = RandomUtil.NextByte(30);
                            if (totalPrize > amountCheck && rnAmountCheck > 20 && rnAmountCheck % 2 == 0)// huy round nay cua ctv
                            {
                                NLogManager.LogMessage("SPIN 2.1");
                                totalPrize -= prizeRound;
                                if(round == 1) continue;
                                
                                bool checkTryWin = false;
                                while (true)
                                {
                                    countRetrySpin++;
                                    if (countRetrySpin > 20)
                                    {
                                        checkTryWin = false;
                                        break;
                                    }
                                    NLogManager.LogMessage("SPIN 4.1");
                                    currentData = (int[,])arrayCopyCheck.Clone(); // clone array and check
                                    
                                    lstNewIcons = new List<DataColumnInfoNew>();
                                    ReplaceMarkedPositions(currentData, rows, cols, lstNewIcons);
                                    
                                    if(IsJackpot(currentData, rows, cols)) continue;
                                    //if(IsFreeSpin(currentData, rows, cols)) continue;
                                    
                                    // update lai ReplaceMarkedPositions cua round truoc :(
                                    finalSpinData[round-2].SetMarkedPositions(lstNewIcons);

                                    int countNumber = 0;
                                    long tryTotalPrize = 0;
                                    var cFrequentNumber = FindFrequentNumber(currentData, rows, cols, out countNumber);// tim so xuat hien nhieu nhat trong mang

                                    if (countNumber >= GameHandler.gameSettings.RuleCountWin && cFrequentNumber != GameHandler.gameSettings.IconsFreeSpin)
                                    {
                                        prizeRound = (long)GetPrizeFromIcon(totalBetValue, cFrequentNumber, countNumber);
                                        tryTotalPrize = totalPrize + prizeRound;
                                        if (tryTotalPrize > amountCheck) continue;
                                        
                                        // tien hanh xoa icon
                                        RemoveTwosAndMarkForReplacement(currentData, rows, cols, cFrequentNumber);
                                        // luu lai mang chuan bi thay doi cho round tiep theo de kiem tra tinh tron ven
                                        arrayCopyCheck = (int[,])currentData.Clone();
                                        
                                        // tao danh sach cho cac icon moi
                                        lstNewIcons = new List<DataColumnInfoNew>();
                                        ReplaceMarkedPositions(currentData, rows, cols, lstNewIcons);
                                        
                                        spinData.SetMarkedPositions(lstNewIcons ?? new List<DataColumnInfoNew>());
                                        
                                        // spinData.SetIconWin(cFrequentNumber);
                                        spinData.SetIconWin(new List<int> { cFrequentNumber }); 
                                        spinData.SetTotalIconWin(countNumber);
                                        spinData.Prize = prizeRound;

                                        checkTryWin = true;
                                    }
                                    
                                    data = (int[,])currentData.Clone();
                                    break;
                                }

                                if (checkTryWin)
                                {
                                    NLogManager.LogMessage("SPIN 5.1");
                                    spinData.FinalSlotData = SlotHelpers.ConvertSlotDataArrayToList(data, rows, cols);
                                    spinData.FinalSlotDataStr = SlotHelpers.ConvertSlotDataArrayToStr(data, rows, cols);
                                    finalSpinData.Add(spinData);
                                    
                                    round++;
                                }
                                continue;
                            }
