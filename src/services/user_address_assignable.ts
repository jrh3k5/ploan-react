// UserAddressAssignable is an interface for an object that can be assigned a user address.
// It is a helper for allowing components to operate against the in-memory personal loan service
// without preventing the use of an actual implementation of the personal loan service interface.
export interface UserAddressAssignable {
    // setUserAddress sets the user address to be referenced by the implementer of this interface.
    setUserAddress(userAddress: string): Promise<void>
}

// setUserAddress will try to invoke the UserAddressAssignable.setUserAddress method
// if it exists on the given reference.
export function setUserAddress(v: any, userAddress: string):  void {
    console.log("asked to set address to ", userAddress);
    const isUserAddressAssignable = "setUserAddress" in v;
    if (isUserAddressAssignable) {
        console.log("invoking setUserAddress");
        (v as UserAddressAssignable).setUserAddress(userAddress);
    }
}
