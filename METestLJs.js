class MemoryStreak
{
    constructor()
    {
        this.dynValue = 0.333;
        this.watValue = 0.333;
        this.rpsValue = 0.333;
    }


    AddMove(weapon)
    {
        if(weapon == 'D')
        {
            this.watValue += 0.25
        }
        else if(weapon == 'W')
        {
            this.rpsValue += 0.25
        }
        else
        {
            this.dynValue += 0.25
        }
        var totalValue = this.dynValue + this.watValue + this.rpsValue;

        this.dynValue = this.dynValue/totalValue;
        this.watValue = this.watValue/totalValue;
        this.rpsValue = this.rpsValue/totalValue;
    }
}

class Memory
{
    constructor()
    {
    this.highMemory = new MemoryStreak;
    this.medMemory = new MemoryStreak;
    this.lowMemory = new MemoryStreak;
    }

    addEnemyMove(drawStreak, dynamiteValue, enemyWeapon)
    {
        if(drawStreak > dynamiteValue + 0.5)
        {
            this.highMemory.AddMove(enemyWeapon);
        }
        else if(drawStreak < dynamiteValue - 1.5)
        {
            this.lowMemory.AddMove(enemyWeapon);
        }
        else
        {
            this.medMemory.AddMove(enemyWeapon);
        }
    }

    GetMemory(drawStreak, dynamiteValue)
    {
        if(drawStreak > dynamiteValue + 0.5)
        {
            return this.highMemory;
        }
        else if(drawStreak < dynamiteValue - 1.5)
        {
            return this.lowMemory;
        }
        else
        {
            return this.medMemory;
        }
    }


}


class Bot {
    
        constructor()
        {
            this.currentDrawStreak = 0;
            this.dynamiteCounter = 0;
            this.enemyDynamiteCounter = 0;
            this.myWins = 0;
            this.enemyWins = 0;
            this.memory= new Memory();
            this.approxWinsLeft = 0;
            this.ev=0;
        }

    
        
    
        UpdateStuff(gamestate)
        {
            var lastBattle = gamestate.rounds[gamestate.rounds.length-1];
            if(lastBattle)
            {
            
            
            var lastP1= lastBattle.p1;
            var lastP2= lastBattle.p2;


            this.memory.addEnemyMove(this.currentDrawStreak,this.ev,lastBattle.p2)
            

            if(gamestate.rounds.length == 0 )
            {
                return;
            }


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
            this.approxWinsLeft = 2000 - 2 * Math.max(this.myWins, this.enemyWins);
            
            var L = this.approxWinsLeft / (Math.pow(3, this.currentDrawStreak));//ApproxNumTimesSituationWillRepeat
            var numberOfDrawsDynOneThird = (Math.log(this.approxWinsLeft) - Math.log(100 - this.dynamiteCounter)) / Math.log(3);//Approx number Of Consecutive Draws Whereby dynamite can be thrown one third of the time.
            var v = Math.max((Math.floor(numberOfDrawsDynOneThird) + 1.0), 0); //Very approx value of dynamite probably underestimate
            var ed = (Math.log(this.approxWinsLeft) - Math.log(100 - this.enemyDynamiteCounter)) / Math.log(3);//Approx number Of Consecutive Draws Whereby dynamite can be thrown one third of the time.
            this.ev = Math.max((Math.floor(ed) + 1.0), 0); //Very approx value of dynamite
            var pW = Math.max((1 -  0.7 * this.ev / (this.currentDrawStreak + 1)) / 3.0, 0);//I don't understand why does 0.8 work better than 1. SOMETHING WRONG!!!!!!!!!!!!!!!!!!!!!
            var pD = 0;
                if( this.currentDrawStreak > numberOfDrawsDynOneThird)
                {
                    pD = 0.33;
                }
                else if (this.currentDrawStreak == Math.floor(numberOfDrawsDynOneThird))
                    {
                            var a = this.approxWinsLeft / (Math.pow(3, this.currentDrawStreak+1));//ApproxNumTimesSituationPlusOneDrawWillRepeat
                            var b = 0.285 * a;//For whatever reason this works fine
                            var c = Math.max(100 - this.dynamiteCounter - b,0);
                            pD = c / L;
                    }
                    else
                    {
                            pD = 0;
                    }

                    var memStreak = this.memory.GetMemory(this.currentDrawStreak,this.ev);

                    var pRPS = 1- pD - pW;

                    pD = Math.max(0, pD * (memStreak.dynValue + 0.1));
                    pW = Math.max(0, pW * (memStreak.watValue + 0.1));
                    pRPS = Math.max(0, pRPS * (memStreak.rpsValue + 0.1));

                    var totalValue = pD + pW + pRPS;

                    pD = pD/totalValue;
                    pW = pW/totalValue;
                    pRPS = pRPS/totalValue;
                       
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