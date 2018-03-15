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



class probVector
{
    constructor(dynProb, watProb, rpsProb)
    {
        this.dynProb = dynProb;
        this.watProb = watProb;
        this.rpsProb = rpsProb;
    }

    getProbOfWeapon(weaponType)
    {
        if(weaponType == 'D')
        {
            return this.dynProb;
        }
        else if (weaponType == 'W')
        {
            return this.watProb;
        }
        else{
            return this.rpsProb;
        }
    }

    getCounterMove()
    {
        return new probVector(this.rpsProb, this.dynProb, this.watProb);
    }
}

class Wave
{
    constructor(frequency, phase)
    {
        this.frequency = frequency;
        this.phase = phase;
    }

    getMoveProb(turn)
    {
        var test = (turn * this.frequency + this.phase + 12)%3
        if(test < 1 )
        {
            return new probVector(this.cosProb(test),this.sinProb(test),0)

        }
        else if(test < 2)
        {
            return new probVector(0,this.sinProb(test),this.cosProb(test))
        }
        else{
            return new probVector(this.sinProb(test),0,this.cosProb(test))
        }
    }

    cosProb(a)
    {
        return Math.pow(Math.cos(Math.PI * a /2),2);
    }

    sinProb(a)
    {
        return Math.pow(Math.sin(Math.PI * a /2),2);
    }
}

class WaveHolder
{
    constructor(wave,score)
    {
        this.wave = wave;
        this.score = score;
    }
}

class WaveMemoryStreak
{
    constructor()
    {
        this.waves=[];
        this.decayRate = 0.8;
        this.moveNumber = 0;

        for(var frequency = -1.5; frequency < 1.5; frequency += 0.15)
        {
            for(var phase = -1.5; phase < 1.5; phase += 0.15)
            {
                wave = new Wave(frequency, phase);
                this.waves.push( new WaveHolder(wave, 0) );
            }
        }
    }

    AddMove(enemyWeapon)
    {
        for(var i =0; i<this.waves.length; i++)
        {
            var prediction = this.waves[i].wave.getMoveProb(this.moveNumber);
            var predictionScore = prediction.getProbOfWeapon(enemyWeapon);
            this.waves[i].score = this.waves[i].score * this.decayRate + predictionScore;
        }
        this.moveNumber++;
    }
    
    getBiggest(accumulator, currentValue)
    {
        return (accumulator.score > currentValue.score) ? accumulator : currentValue;
    }

    getProb()
    {
        return this.waves.reduce(this.getBiggest).wave.getMoveProb(this.moveNumber);
    }

    getNextShotProbValues()
    {
        var prob = this.getProb()
        return prob.getCounterMove();
    }


}

class MasterMemory
{
    constructor() {
        this.highMemory = new WaveMemoryStreak();
        this.medMemory = new WaveMemoryStreak();
        this.lowMemory = new MemoryStreak();
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

    GetMemoryValues(drawStreak, dynamiteValue)
    {
        if(drawStreak > dynamiteValue + 0.5)
        {
            return this.highMemory.getNextShotProbValues();
        }
        else if(drawStreak < dynamiteValue - 1.5)
        {
            return new probVector(this.lowMemory.dynValue, this.lowMemory.watValue,this.lowMemory.rpsValue);
        }
        else
        {
            return this.medMemory.getNextShotProbValues();
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
        this.masterMemory= new MasterMemory();
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


        this.masterMemory.addEnemyMove(this.currentDrawStreak,this.ev,lastBattle.p2)
        

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

                /*var memStreak = this.memory.GetMemory(this.currentDrawStreak,this.ev);
                pD = Math.max(0, pD * (memStreak.dynValue + 0.1));
                pW = Math.max(0, pW * (memStreak.watValue + 0.1));
                pRps = Math.max(0, pRps * (memStreak.rpsValue + 0.1));*/

                var pRps = 1- pD - pW;

                var values = this.masterMemory.GetMemoryValues(this.currentDrawStreak, this.ev);

                pD = Math.max(0, pD * (values.dynProb ));
                pW = Math.max(0, pW * (values.watProb ));
                pRps = Math.max(0, pRps * (values.rpsProb ));
                if(this.currentDrawStreak > this.ev)
                {
                pD = Math.max(0,  (values.dynProb));
                pW = Math.max(0,  (values.watProb));
                pRps = Math.max(0,  (values.rpsProb));
                }

                if (this.currentDrawStreak == this.ev)
                {
                    pD = Math.max(0, (values.dynProb));
                    pW = Math.max(0, (values.watProb));
                    pRps = Math.max(0, (values.rpsProb));
                }              
                

                var totalValue = pD + pW + pRps;

                pD = pD/totalValue;
                pW = pW/totalValue;
                pRps = pRps/totalValue;
                   
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

function  RandRockPaperScissorDynWat()
{
    Math.random();
    Math.random();
    Math.random();
    var x = 4 * Math.random();
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
    if(x<= 3.6)
    {
        return 'W';
    }
    if(x<= 4)
    {
        return 'D';
    }
}


var p = new probVector(0.75,0.25,0);
var counter = p.getCounterMove();

console.log(`0,0.75,0.25 ${counter.dynProb}, ${counter.watProb}, ${counter.rpsProb}`);

var wave = new Wave(-0.5, 0.5);
console.log(' ');
console.log('should repeat twice and start between wat and rock and travel opposite to how it started')
for(x =0; x < 12; x++)
{
    console.log(wave.getMoveProb(x))
}

console.log('');
console.log('should be rock and wat')
var wave = new Wave(0, 1.5);

for(x =0; x < 10; x++)
{
    console.log(wave.getMoveProb(x))
}

var waveMemStreak = new WaveMemoryStreak();
console.log("should have waves");
console.log(waveMemStreak);

console.log(waveMemStreak.waves.reduce(waveMemStreak.getBiggest));

console.log(waveMemStreak.getProb());

waveMemStreak.AddMove('D');

console.log(waveMemStreak.waves.reduce(waveMemStreak.getBiggest));

console.log(waveMemStreak.getProb());

waveMemStreak.AddMove('D');

console.log(waveMemStreak.waves.reduce(waveMemStreak.getBiggest));

console.log(waveMemStreak.getProb());

waveMemStreak.AddMove('R');

console.log(waveMemStreak.waves.reduce(waveMemStreak.getBiggest));

console.log(waveMemStreak.getProb());

console.log(waveMemStreak.getNextShotProbValues());
var b = new Bot();
var gamestate = {rounds: [
]}
for(var i = 0; i<100; i++)
{
    b.makeMove(gamestate);
    gamestate.rounds.push(
    {
        p1: RandRockPaperScissorDynWat(),
        p2: "D",
    });
}
for(var i = 0; i<1800; i++)
{
    b.makeMove(gamestate);
    gamestate.rounds.push(
    {
        p1: RandRockPaperScissorDynWat(),
        p2: RandRockPaperScissorDynWat(),
    });
}


b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
        {
            p1: 'D',
            p2: 'W'
        });
b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
        {
            p1: 'D',
            p2: 'W'
        });
b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
        {
            p1: 'D',
            p2: 'W'
        });
b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
        {
            p1: 'D',
            p2: 'W'
        });
b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'R'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
        {
            p1: 'D',
            p2: 'W'
        });
b.makeMove(gamestate);
    


b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'D',
        p2: 'W'
    });
    b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'W',
        p2: 'D'
    });

b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'D',
        p2: 'D'
    });

b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'D',
        p2: 'D'
    });

console.log(b.makeMove(gamestate));
gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'W'
    });
    b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'D',
        p2: 'D'
    });

b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'D',
        p2: 'D'
    });

console.log(b.makeMove(gamestate));
gamestate.rounds.push(
    {
        p1: 'R',
        p2: 'W'
    });
    b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'D',
        p2: 'D'
    });

b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'W',
        p2: 'W'
    });

console.log(b.makeMove(gamestate));
gamestate.rounds.push(
    {
        p1: 'S',
        p2: 'R'
    });

b.makeMove(gamestate);
gamestate.rounds.push(
    {
        p1: 'D',
        p2: 'D'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
        {
            p1: 'D',
            p2: 'D'
        });
        b.makeMove(gamestate);
        gamestate.rounds.push(
            {
                p1: 'D',
                p2: 'D'
            });
            b.makeMove(gamestate);
            console.log(b.makeMove(gamestate));
gamestate.rounds.push(
    {
        p1: 'D',
        p2: 'D'
    });
    b.makeMove(gamestate);
    gamestate.rounds.push(
        {
            p1: 'D',
            p2: 'D'
        });
        b.makeMove(gamestate);
        gamestate.rounds.push(
            {
                p1: 'D',
                p2: 'D'
            });
            console.log(b.makeMove(gamestate));



