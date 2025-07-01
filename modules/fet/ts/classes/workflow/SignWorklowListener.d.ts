/// <reference path="SignWorkflow.ts" />
/// <reference path="../../enums/SignWorkflowState.ts" />

declare namespace FET {

    export interface SignWorkflowListener {

        stateChanged?(
            workflow: SignWorkflow,
            oldState: SignWorkflowState,
            newState: SignWorkflowState ): void;

    }

}
