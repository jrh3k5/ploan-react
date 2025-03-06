// ApplicationState describes the state of the application at any particular time.
export class ApplicationState {
  processing: boolean; // the application is currently processing some input

  constructor(processing: boolean) {
    this.processing = processing;
  }

  // clone creates a copy of this state to protect the state from mutation
  clone(): ApplicationState {
    return new ApplicationState(this.processing);
  }
}
