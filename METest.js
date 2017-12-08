class Bot {
    
        constructor()
        {
            this.currentDrawStreak = 0;
            this.dynamiteCounter = 0;
            this.enemyDynamiteCounter = 0;
            this.myWins = 0;
            this.enemyWins = 0;
        }
    
        
    
        UpdateStuff(gamestate)
        {
            if(gamestate.rounds.length == 0 )
            {
                return;
            }
            var lastBattle = gamestate.rounds[gamestate.rounds.length-1];
            var lastP1= lastBattle.p1;
            var lastP2= lastBattle.p2;
            if(lastP1 == 'D')
            {
                this.dynamiteCounter++;
            }
            if(lastP2 == 'D')
            {
                this.enemyDynamiteCounter++;
            }
    
            if (lastP1 == lastP2)
            {
                this.currentDrawStreak++;
                return;
            }
            else
            {
                
                if(this.PlayerOneIsWinner(lastP1,lastP2))
                {
                    this.myWins += this.currentDrawStreak + 1;
                }
                else
                {
                    this.enemyWins += this.currentDrawStreak + 1;
                }
                this.currentDrawStreak = 0;
            }
    
    
        }
    
        PlayerOneIsWinner(P1, P2)
        {
            if((P1 == 'D' && P2 != 'W')
            || (P1 == 'W' && P2 == 'D')
            || (P1 != 'D' && P2 == 'W')
            || (P1 == 'R' && P2 == 'S')
            || (P1 == 'S' && P2 == 'P')
            || (P1 == 'P' && P2 == 'R'))
            {
                return true;
            }
            return false;
    
    
        }
    
        RandRockPaperScissor()
        {
            Math.random();
            Math.random();
            Math.random();
            var x = 3 * Math.random();
            if(x<1)
            {
                return 'R';
            }
            if(x<2)
            {
                return 'P';
            }
            if(x<= 3)
            {
                return 'S';
            }
        }
    
        makeMove(gamestate) {
            this.UpdateStuff(gamestate);
            var approxWinsLeft = 2000 - 2 * Math.max(this.myWins, this.enemyWins);
            
            var L = approxWinsLeft / (Math.pow(3, this.currentDrawStreak));//ApproxNumTimesSituationWillRepeat
            var numberOfDrawsDynOneThird = (Math.log(approxWinsLeft) - Math.log(100 - this.dynamiteCounter)) / Math.log(3);//Approx number Of Consecutive Draws Whereby dynamite can be thrown one third of the time.
            var v = Math.max((Math.floor(numberOfDrawsDynOneThird) + 1.0), 0); //Very approx value of dynamite probably underestimate
            var ed = (Math.log(approxWinsLeft) - Math.log(100 - this.enemyDynamiteCounter)) / Math.log(3);//Approx number Of Consecutive Draws Whereby dynamite can be thrown one third of the time.
            var ev = Math.max((Math.floor(ed) + 1.0), 0); //Very approx value of dynamite
            var pW = Math.max((1 -  0.7 * ev / (this.currentDrawStreak + 1)) / 3.0, 0);//I don't understand why does 0.8 work better than 1. SOMETHING WRONG!!!!!!!!!!!!!!!!!!!!!
            var pD = 0;
                if( this.currentDrawStreak > numberOfDrawsDynOneThird)
                {
                    pD = 0.33;
                }
                else if (this.currentDrawStreak == Math.floor(numberOfDrawsDynOneThird))
                    {
                            var a = approxWinsLeft / (Math.pow(3, this.currentDrawStreak+1));//ApproxNumTimesSituationPlusOneDrawWillRepeat
                            var b = 0.285 * a;//For whatever reason this works fine
                            var c = Math.max(100 - this.dynamiteCounter - b,0);
                            pD = c / L;
                    }
                    else
                    {
                            pD = 0;
                    }
                       
                    var weaponChoice = Math.random();
                        if (weaponChoice < pW)
                        {
                            return 'W';
                        }
                        if(weaponChoice < pW + pD)
                        {
                            return 'D';
                        }
            
                        return this.RandRockPaperScissor();// returns rock, paper, scissors randomly.
            
    
        }
    }
module.exports = new Bot();