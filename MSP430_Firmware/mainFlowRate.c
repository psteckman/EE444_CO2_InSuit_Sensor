#include <__cross_studio_io.h>
#include <msp430.h>

#define PRES_SENS_ADDR = 0x81 //define I2C address of pressure sensor. 

char rtc_value=0; // increments by 1 every 2 seconds
char rtc_flag=0;
char DiffPress;

void main(void)
{
  P11SEL |= BIT0+BIT1+BIT2; // For monitoring clocks
  P11DIR |= BIT0+BIT1+BIT2; //Set clocks to output
   
  P3SEL |= BIT7; //Set 3.7 to I2C data function
  P5SEL |= BIT4; // Set 5.4 to I2C clock function

  P3DIR &= ~BIT7; //Set I2C data pin as input for data from sensor
  P5DIR |= BIT4; //Set MSP Clock as output for sensor to use.

  P1DIR |= BIT0 + BIT1; //set LEDs as outputs
  P1OUT &= ~(BIT0 + BIT1); // Turn off LEDs

  UCB1I2CSA = 0x81; //I2C address = 0x80 by default. Add 1 to indicate we want to read from the slave. 
 
  UCB1CTL0 |= UCMODE_3 + UCSYNC; //Set to I2C mode, synchronous.   

  UCB1CTL1 |= UCSSEL__SMCLK + UCSWRST; //Select SMCLK as source

  UCB1BR0 = 10;
  UCB1BR1 = 0; 
 
  UCB1CTL1 &= ~UCSWRST; //Release reset condition

  // Set up RTC registers
  RTCPS0CTL |= RT0PSDIV_7; // divide ACLK by 256
  RTCPS1CTL |= RT1SSEL_2; //RT0PS as source
  RTCPS1CTL |= RT1PSDIV_7; // divide output of RT0PS by 64
  RTCPS1CTL |= RT1IP_2; // interrupt frequency is 1/8 of RT0PS (16 Hz or 62.5 ms)
  RTCPS1CTL |= RT1PSIE; // Enable interrupts
  RTCPS1CTL &= ~(RT1PSIFG); // Clear IFG
  //Enable RTC for both control registers. 
  RTCPS0CTL &= ~(RT0PSHOLD); 
  RTCPS1CTL &= ~(RT1PSHOLD); 

  //I2C interrupt vectors, USCIAB0TX_VECTOR for both rx and tx. USCIAB0RX_VECTOR used for four state-change vectors in UCB0STAT
  _EINT();
  while(1){}
}

#pragma vector=RTC_VECTOR // RTC Interrupt
__interrupt void timer_a (void) {
  switch(RTCIV)
  {
    case(RTCIV_RT1PSIFG):      
      P1OUT ^= BIT1;
      //rtc_value++;
      ///Reset rtc every minute for timed flash saving. 
      if (rtc_value==30) { //Recall rtc increases by 1 every 2 seconds. Thus 30 for rtc_count corresponds to 1 minute. 
        rtc_value=0;
        rtc_flag=1;
        LPM0_EXIT;
        }
      break;
    default:
      return;
  }
}