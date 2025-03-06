import { ApplicationState } from "@/models/application_state";

// ApplicationStateListener defines a type that can listen to changes in the application state.
export type ApplicationStateListener = {
  (appState: ApplicationState): Promise<void>;
};

// ApplicationStateService defines a means of communicating the current state of the application.
export interface ApplicationStateService {
  // startProcessing informs the application that a component has started processing.
  // The processor ID is a human-readable identifier used to assist in troubleshooting if
  // there are any dangling processing states.
  // Invokers are expected to call complete() on the returned token once processing has finished,
  // regardless of success or failure.
  startProcessing(processorId: string): Promise<ProcessingToken>;
}

// ProcessingToken is used to communicate when a processing event has finished.
export interface ProcessingToken {
  // complete marks the processing event that generated the token as complete.
  complete(): Promise<void>;
}

// ApplicationStateSubscriptionService
export interface ApplicationStateSubscriptionService {
  // subscribe subscribes for updates to the application state.
  // It returns a function that can be used to unsubscribe from updates.
  subscribe(listener: ApplicationStateListener): Promise<() => Promise<void>>;
}

export class InMemoryApplicationStateService
  implements ApplicationStateService, ApplicationStateSubscriptionService
{
  private listeners: ApplicationStateListener[];
  private processingTokens: InMemoryProcessingToken[];
  private appState: ApplicationState;
  private tokenBucket: bigint;

  constructor() {
    this.listeners = [];
    this.processingTokens = [];
    this.appState = new ApplicationState(false);
    this.tokenBucket = BigInt(0);
  }
  async startProcessing(processorId: string): Promise<ProcessingToken> {
    const tokenId = `${++this.tokenBucket}`;
    const processingToken = new InMemoryProcessingToken(
      this,
      tokenId,
      processorId,
    );
    this.processingTokens.push(processingToken);

    this.appState.processing = true;
    await this.publishApplicationState();

    return processingToken;
  }

  async subscribe(
    listener: (appState: ApplicationState) => Promise<void>,
  ): Promise<() => Promise<void>> {
    this.listeners.push(listener);

    return async () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async publishApplicationState(): Promise<void> {
    const appStateClone = this.appState.clone();
    await Promise.all(this.listeners.map((l) => l(appStateClone)));
  }

  async popToken(token: InMemoryProcessingToken): Promise<void> {
    for (let i = this.processingTokens.length - 1; i >= 0; i--) {
      if (this.processingTokens[i].tokenId == token.tokenId) {
        this.processingTokens.splice(i, 1);
      }
    }

    if (this.processingTokens.length == 0 && this.appState.processing) {
      this.appState.processing = false;
      await this.publishApplicationState();
    }
  }
}

class InMemoryProcessingToken implements ProcessingToken {
  parentService: InMemoryApplicationStateService;
  tokenId: string;
  processorId: string;

  constructor(
    parentService: InMemoryApplicationStateService,
    tokenId: string,
    processorId: string,
  ) {
    this.parentService = parentService;
    this.tokenId = tokenId;
    this.processorId = processorId;
  }
  async complete(): Promise<void> {
    this.parentService.popToken(this);
  }
}
