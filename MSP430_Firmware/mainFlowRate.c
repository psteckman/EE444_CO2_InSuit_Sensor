#include <__cross_studio_io.h>
#include <msp430.h>

#define PRES_SENS_ADDR 0x81 //define I2C address of pressure sensor. 
#define NUM_BYTES_RX 6

extern int IncrementVcore (void);
void Write_Bytes(char , char ); 
void I2C_Setup(void); 

char rtc_value=0; // increments by 1 every 2 seconds
char rtc_flag=0;
char DiffPress;

int i;

//local vars for TI code

unsigned char *PRxData;                     // Pointer to RX data
unsigned char RXByteCtr = 2;
unsigned char TXByteCtr = 3;                // Counter for Tx bytes (address write, measurement command, address read)
unsigned char sensorMeasCmd = 0xf1;         // Command for measuring from the Sensiron Diff. Pressure sensor. 
unsigned char writeAddress = 0x80;          //0x80 hex?
unsigned char readAddress = 0x81; 
unsigned char slaveAddress = 0x40; 
volatile unsigned char RxBuffer[128];       // Allocate 128 byte of RAM


void main(void)
{
  while(IncrementVcore()){}
  P11SEL |= BIT0+BIT1+BIT2; // For monitoring clocks
  P11DIR |= BIT0+BIT1+BIT2; //Set clocks to output

  WDTCTL = WDTPW + WDTHOLD;         //Stop WDT

  //P5SEL = BIT6 + BIT7; //A1 might not needs this if not using uart
//  P3SEL = 0b00000000;
//  P5SEL = 0b00000000;

//  P3DIR |= BIT7;
//  P5DIR |= BIT4;

//  for(i = 0;i < 100; i++){
//    P3OUT ^= BIT7;
//    P5OUT ^= BIT4;
//  }

  //P3OUT ^= BIT7;
  

    /*
    //I2c pins (UCB0)
    P3SEL  |= BIT1 + BIT0;  // Assign I2C pins to USCI_B0, P3.1 = SCL, P3.0 = SDA
    P3DS |= BIT1 + BIT0;
    */


  //P1DIR |= BIT0 + BIT1; //set LEDs as outputs
  //P1OUT &= ~(BIT0 + BIT1); // Turn off LEDs
/*
  UCB1I2CSA = 0x81; //I2C address = 0x80 by default. Add 1 to indicate we want to read from the slave. 

  UCB1CTL0 |= UCMODE_3 + UCSYNC + UCMST; //Set to I2C mode, synchronous, master mode. 

  UCB1CTL1 |= UCSSEL__SMCLK + UCSWRST; //Select SMCLK as source

  UCB1BR0 = 10;
  UCB1BR1 = 0; 
 
  UCB1IE |= UCRXIE + UCNACKIE + UCTXIE;

  UCB1CTL1 &= ~UCSWRST; //Release reset condition
*/

  I2C_Setup();
 
/*
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
*/
  _EINT();

  
  while(1){
    Write_Bytes(slaveAddress, sensorMeasCmd);
    //Read_Bytes(readAddress, slaveAddress, RxBuffer, NUM_BYTES_RX); 
  }
  
}

  //UCSI Interrupt
  // Case 4 is slave did not ACK - set for stop or repeated start. 

//-------------------------------------------------------------------------------
// The USCI_B0 data ISR is used to move received data from the I2C slave
// to the MSP430 memory. It is structured such that it can be used to receive
// any 2+ number of bytes by pre-loading RXByteCtr with the byte count.
//-------------------------------------------------------------------------------
#pragma vector = USCI_B1_VECTOR
__interrupt void USCI_B1_ISR(void)
{
  switch(__even_in_range(UCB1IV,12))
  {
  case  0: break;                           // Vector  0: No interrupts
  case  2: break;                           // Vector  2: ALIFG
  case  4: 
    UCB1CTL1 |= UCTXSTP;                    // Vector  4: NACKIFG
    //while(UCB1CTL1 & UCTXSTP);              //wait until stop condition got sent
    //Write_Bytes(writeAddress, sensorMeasCmd);
    break;                           
  case  6: break;                           // Vector  6: STTIFG
  case  8: break;                           // Vector  8: STPIFG
  case 10:                                  // Vector 10: RXIFG
    RXByteCtr--;                            // Decrement RX byte counter
    if (RXByteCtr)
    {
      *PRxData++ = UCB1RXBUF;               // Move RX data to address PRxData
      if (RXByteCtr == 1)                   // Only one byte left?
        UCB1CTL1 |= UCTXSTP;                // Generate I2C stop condition
    }
    else
    {
      *PRxData = UCB1RXBUF;                 // Move final RX data to PRxData
      __bic_SR_register_on_exit(LPM0_bits); // Exit active CPU
    }
    break; 
  case 12: break;                           // Vector 12: TXIFG
  default: break; 
  }
}


  //Test using TI code
  /*while (1)
  {
    PRxData = (unsigned char *)RxBuffer;    // Start of RX buffer
    RXByteCtr = 5;                          // Load RX byte counter
    while (UCB1CTL1 & UCTXSTP);             // Ensure stop condition got sent
    UCB1CTL1 |= UCTXSTT;                    // I2C start condition
    
    __bis_SR_register(LPM0_bits + GIE);     // Enter LPM0, enable interrupts
                                            // Remain in LPM0 until all data
                                            // is RX'd
    __no_operation();                       // Set breakpoint >>here<< and
  } */


#pragma vector=RTC_VECTOR // RTC Interrupt
__interrupt void timer_a (void) {
  switch(RTCIV)
  {
    case(RTCIV_RT1PSIFG):  
      Write_Bytes(writeAddress, sensorMeasCmd);
      break;
    default:
      return;
  }
}


void Transmit(void) {
  while (UCB1CTL1 & UCTXSTP);       // Ensure stop condition got sent
  UCB1CTL1 |= UCTXSTT;             // I2C TX, start condition
  //Transmit read byte 0x80, command bit 0xF1, and write bit 0x81. 
  _EINT();
  LPM0; 
}

void I2C_Setup(void){

    UCB1CTL1   |= UCSWRST;                    // reset SW to stale I2C communications and to setup I2C registers
    P3SEL |= BIT7;                            //Set 3.7 to I2C data function
    P5SEL |= BIT4;                            // Set 5.4 to I2C clock function

    P3DS |= BIT7;
    P5DS |= BIT4;

    UCB1CTL0  |= UCSYNC + UCMODE_3 + UCMST;           // sync: I2C Master mode 
    UCB1CTL1          |= 	UCSSEL__SMCLK;        //SMCLK as clock source (1 MHz)
    UCB1BRW           = 10;                           // fSCL = SMCLK/scalar = ~100 kHz (typical bus freq of sensor. Max freq is 400 kHz)
    UCB1I2CSA       |=        slaveAddress; 
    UCB1CTL1          &= ~UCSWRST;                    //clear SW to start I2C communications 
    P5OUT  ^= BIT4; 
    UCB1IE |= UCTXIE + UCRXIE + UCNACKIE;
}

void Write_Bytes(char write_add, char command){

      //while (UCB1CTL1 & UCTXSTP); 
      //UCB1CTL1        |=       UCTR + UCTXSTP;
      //for(i=0; i<10000; i++);
      UCB1I2CSA       =        write_add;                  //slave address for transmit mode
      UCB1CTL1        |=       UCTR + UCTXSTT;             // I2C transmit (write) mode + generating START condition
      //UCB1TXBUF       |=       write_add + 0; 
      //while(!(UCB1IFG & UCTXIFG));                          //wait until address got sent
      //UCB1TXBUF       =        command;               //register address to measure temperature/pressure
      //while(!(UCB1IFG & UCTXIFG));                          //wait until reg address got sent      
      //while(UCB1CTL1 & UCTXSTT);                    //wait till START condition is cleared 
      UCB1TXBUF       =        command;                       //send command to sensor to read 2 bytes of data
      while(!(UCB1IFG & UCTXIFG));                          //wait until command got sent
      //UCB1CTL1        |=       UCTXSTP;                    //generate a STOP condition
      //while(UCB1CTL1 & UCTXSTP);                            //wait until stop condition got sent
      UCB1CTL1     |=   UCTXSTT; 
      UCB1CTL1     &=  ~UCTR;

}


void Read_Bytes(char read_add, char slave_add, char *buffer, unsigned int Num_Bytes){
unsigned int i;

    UCB1I2CSA	=	slave_add;                        //slave address
    //while(!(UCB1IFG & UCTXIFG));                          //wait until slave address got sent
    UCB1CTL1 	|= 	UCTXSTT;                   // Generating START condition + I2C transmit (write) 	
    UCB1TXBUF 	=	read_add;                     //write register address	
    while(!(UCB1IFG & UCTXIFG));                          //wait until reg address got sent    
    /*
    while( UCB1CTL1 & UCTXSTT);                           //wait till START condition is cleared 
    UCB1CTL1 	|= 	UCTXSTT;                          //generate RE-START condition	
    UCB1I2CSA	=	slave_add;                          //slave address
    UCB1CTL1 	&=~ UCTR;                                 //receive mode
    while( UCB1CTL1 & UCTXSTT);                         //wait till START condition is cleared 
    buffer[0] = UCB1RXBUF;                              //dummy read
    while(!(UCB1IFG & UCRXIFG));                        //wait till byte is completely read
    for(i=0;i<Num_Bytes-1;++i){
    buffer[i] = UCB1RXBUF;                              //burst read
    while(!(UCB1IFG & UCRXIFG));                        //wait while the Byte has being read
    }
    buffer[Num_Bytes-1] = UCB1RXBUF;                   //last Byte read
    while(!(UCB1IFG & UCRXIFG));                        //wait
    UCB1CTL1 	|=	 UCTXSTP;                         //generate stop condition
    while(UCB1CTL1 & UCTXSTP);                            //wait till stop condition got sent
    */
}
