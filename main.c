// Dial, Ryker; Steckman, Patrick; Taylor, Camden
// In-Suit CO2 Sensor Project
// MSP430 Code. This code is for the MSP430 microprocessor that
//     will be connected to the SprintIR CO2 sensor, the 
//     Sensiron flow rate sensor, and the Bluetooth Low Energy
//     transmitter.
// Date Created: March 21, 2016
// Last Modified: March 21, 2016

#include <msp430.h>

void main(void)
{
    // ***** Begin Clock Setup
    // For testing purposes, operate clocks at 16 MHz.
    //     Actual frequency TBD.
    UCSCTL1 |= DCORSEL_4; // Set DCO tap to 2 - 20 MHz

    // Want 16 MHz clock, so N+1 = 16 MHz / 32,768 Hz = 488
    // So FLLN = 487
    // Fine tuned to 477 for EXPERIMENTER BOARD
    UCSCTL2 |= 477;

    // Get MCLK and SMCLK from DCOCLKDIV
    UCSCTL4 |= SELM__DCOCLKDIV + SELS__DCOCLKDIV;

    UCSCTL5 = 0; // Don't divide clock

    // EXPERIMENTER BOARD ONLY
    // Output MCLK & SMCLK for verification purposes
    P11SEL |= BIT2 + BIT1;
    P11DIR |= BIT2 + BIT1;
    // ***** End Clock Setup


    // ***** UART Setup *****

    // UART #1: SprintIR CO2 Sensor
    // Specifications:
    //     Baud Rate: 9600
    //     Data Bits: 8
    //     Parity: None
    //     Stop Bits: 1
    // Sprint IR reports the CO2 concentration in the following format:
    //     Z ##### z #####\r\n
    //     Where Z ##### shows the CO2 concentration after digital filtering
    //     and z ##### shows instantaneous concentration without filtering.
    //     Units are ppm/10.
    
    // EXPERIMENTER BOARD ONLY
    // Setup P3.4 & P3.5 as TX and RX for UCA0
    // These pins will be different for MSP4305244
    P3SEL |= BIT5 + BIT4;

    UCA0CTL0 = 0; // All zeros selects the desired specifications

    // Get BRCLK from SMCLK. 32 kHz crystal can be used to conserve power,
    //     but the max error in TX and RX is ~20%!
    UCA0CTL1 |= UCSSEL__SMCLK;

    // Use oversampling mode. From Table 36-5 on page 955 of the
    //     MSP430x5xx and MSP430x6xx Family User's guide (Rev. O),
    //     the settings for 9600 baud at 16 MHz are UCBRx = 104, 
    //     UCBRSx = 0, and UCBRFx = 3.
    UCA0BR0 = 104;
    UCA0BR1 = 0;
    UCA0MCTL |= UCOS16 + UCBRF_3;
  
    UCA0CTL1 &= ~UCSWRST; // Release UART for operation

    // Only need to transmit to SprintIR during initial config
    UCA0IE |= UCRXIE + UCTXIE; 

    // FOR TESTING
    UCA0IFG = UCTXIFG; // Mark TX buffer as empty or interrupt will wait forever

    // UART #2: BLE Module
    //***** FOR TESTING PURPOSES ONLY
        // EXPERIMENTER BOARD ONLY
        // Setup PC serial connection
        P5SEL |= BIT7 + BIT6;

        UCA1CTL1 |= UCSWRST; // Hold logic in reset state to modify control registers.
        UCA1CTL0 = 0; // All zeros selects the desired specifications
    
        // Get BRCLK from SMCLK. 32 kHz crystal can be used to conserve power,
        //     but the max error in TX and RX is ~20%!
        UCA1CTL1 |= UCSSEL__SMCLK;

        // Use oversampling mode. From Table 36-5 on page 955 of the
        //     MSP430x5xx and MSP430x6xx Family User's guide (Rev. O),
        //     the settings for 9600 baud at 16 MHz are UCBRx = 104, 
        //     UCBRSx = 0, and UCBRFx = 3.
        UCA1BR0 = 104;
        UCA1BR1 = 0;
        UCA1MCTL |= UCOS16 + UCBRF_3;
      
        UCA1CTL1 &= ~UCSWRST; // Release UART for operation

        // Only need to transmit to SprintIR during initial config
        UCA1IE |= UCRXIE + UCTXIE; 

        // FOR TESTING
        UCA1IFG = UCTXIFG; // Mark TX buffer as empty or interrupt will wait forever
    // ***** END TESTING SECTION. NOT FOR FINAL BUILD
   
    // ***** End UART Setup *****

    _EINT();

    while(1){
        
    }
}

// ISR for SprintIR Communications
void USCI_A0_ISR(void) __interrupt[USCI_A0_VECTOR] {
    switch(UCA0IV) {
        case 2: // Received a character

            // *** Testing only
            //while(!(UCA0IFG & UCTXIFG));
            UCA0TXBUF = UCA0RXBUF; // echo received character
            // ***

            break;
        default:
            break;
    }
    UCA0IV = 0;
}

// ISR for PC Communications
// In final version this will be for the BLE module.
void USCI_A1_ISR(void) __interrupt[USCI_A1_VECTOR] {
    switch(UCA1IV) {
        case 2: // Received a character

            // *** Testing only
           // while(!(UCA1IFG & UCTXIFG));
            UCA1TXBUF = UCA1RXBUF; // echo received character
            // ***

            break;
        default:
            break;
    }
    UCA1IV = 0;
}
