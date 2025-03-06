// ProcessingAwareProps defines a common entry for properties of a component that
// can be aware of the application beig in a processing state.
export interface ProcessingAwareProps {
  // isProcessing is used to communicate to the component if the application is in a processing state or not.
  isProcessing: boolean | undefined;
}
