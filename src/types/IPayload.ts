import { Action } from "./Action";
import { Currency } from "./Currency";
import { Language } from "./Language";

export interface IPayload {
    action: Action;
    amount: number;
    currency: Currency;
    description: string;
    order_id: string;
    language?: Language;
}
