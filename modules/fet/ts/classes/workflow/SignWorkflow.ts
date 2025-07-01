/// <reference path="../../enums/SignWorkflowState.ts" />
/// <reference path="SignWorklowListener.d.ts" />
/// <reference path="../../bean/Session.d.ts" />

namespace FET {

    export class SignWorkflow {

        private state: SignWorkflowState;
        private session: Session;
        private listeners: SignWorkflowListener[];

        public constructor( session: Session, listener?: SignWorkflowListener ) {
            this.state = SignWorkflowState.CONFIGURING;
            this.session = session;
            this.listeners = [];
            // Add listener if any
            if ( listener ) {
                this.addListener( listener );
            }
        }

        public addListener( listener: SignWorkflowListener ): void {
            if ( listener ) {
                this.listeners.push( listener );
            }
        }

        public getState(): SignWorkflowState {
            return this.state;
        }

        public setState( state: SignWorkflowState ): void {
            if ( this.state != state ) {
                // Store old state
                let oldState = this.state;
                // Implement workflow
                switch ( +state ) {
                    case SignWorkflowState.FILE_SELECTION:
                    case SignWorkflowState.UPLOADING_FILE:
                    case SignWorkflowState.ASKING_FOR_MORE_FILES:
                        // If cannot add files, go to sign channel state
                        if ( !this.session.addFilesAllowed ) {
                            if(this.session.isStandalone){
                                this.setState( SignWorkflowState.SIGN_METHOD_SELECTION );

                            } else {
                                this.setState( SignWorkflowState.SIGN_CHANNEL_SELECTION );

                            }
                            return;
                        }
                        break;
                    case SignWorkflowState.CONFIGURING:
                    case SignWorkflowState.CREATING_SESSION:
                    case SignWorkflowState.RETRIEVING_SESSION:
                    case SignWorkflowState.SIGN_METHOD_SELECTION:
                    case SignWorkflowState.INITIALIZING_ASOL:
                    case SignWorkflowState.CONFIGURE_ARSS:
                    case SignWorkflowState.SIGNING:
                    case SignWorkflowState.CONFIGURE_ASOL:
                    case SignWorkflowState.ASOL_PREPARING_FILES:
                    case SignWorkflowState.ASOL_SIGNING:
                    case SignWorkflowState.ASOL_FINALIZING_SIGNATURE:
                    case SignWorkflowState.SIGN_CHANNEL_SELECTION:
                    case SignWorkflowState.CONFIGURE_EXSYST_CHANNEL:
                    case SignWorkflowState.EXSYST_TYPOLOGY_SELECTION:
                    case SignWorkflowState.EXSYST_FINALIZING_SIGNATURE:
                    case SignWorkflowState.COMPLETED_EXSYST:
                    case SignWorkflowState.COMPLETED:
                }
                // Fallback is to set the state
                this.state = state;
                this.raiseStateChanged( oldState, state );
            }
        }

        private raiseStateChanged( oldState: SignWorkflowState, newState: SignWorkflowState ): void {
            for ( let listener of this.listeners ) {
                try {
                    if ( typeof listener == "object" && typeof listener.stateChanged == "function" ) {
                        listener.stateChanged( this, oldState, newState );
                    }
                } catch ( e ) {
                    console.error( "Error notifying state change", e );
                }
            }
        }

    }

}