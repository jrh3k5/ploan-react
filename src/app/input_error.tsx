// InputError is an element that can be used to display an error for a particular form input
export function InputError(props: { message: string }) {
  return <div className="error">{props.message}</div>;
}
