import { IPayload } from "./IPayload";

export interface IPaymentInfo extends IPayload {
    public_key: string;
    version?: string;
    sandbox?: string;
}