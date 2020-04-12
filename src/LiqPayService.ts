import { createHash } from 'crypto';
import {
    IPayload,
    Language,
    IPaymentInfo,
    ISignature,
} from './types';

export class LiqPay {
    private baseUrl: string = 'https://www.liqpay.ua/api';
    private imageSrc: string = '//static.liqpay.ua/buttons/p1ru.radius.png';
    private apiVersion: string = '3';

    constructor(
        private privateKey: string,
        private publicKey: string,
        private enableSandbox: boolean = false,
    ) { }

    /**
     * Sets LiqPay API version. By default used version 3.
     *
     * @param {string} apiVersion - version of liqpay API
     * 
     * @returns {void}
     */
    public setApiVersion(apiVersion: string): void {
        if (!apiVersion) {
            throw new TypeError(`API version not specified!`);
        }

        this.apiVersion = apiVersion;
    }

    /**
     * Generates html form with specific data.
     *
     * @param {IPayload} payload - liqpay payload data
     * 
     * @returns {string} - html form
     */
    public getHtmlForm(payload: IPayload): string {
        const { data, signature } = this.getObjData(payload);

        return `
            <form method="POST" action="${this.baseUrl}/${this.apiVersion}/checkout" accept-charset="utf-8">
                <input type="hidden" name="data" value="${data}" />
                <input type="hidden" name="signature" value="${signature}" />
                <input type="image" src="${this.imageSrc}" />
            </form>
        `;
    }

    /**
     * Generates data and signature for liqpay payment
     *
     * @param {IPayload} payload - liqpay payload data
     * 
     * @returns {ISignature}
     */
    public getObjData(payload: IPayload): ISignature {
        const payment: IPaymentInfo = this.preparePayment(payload);

        this.verifyPaymentData(payment);

        const data: string = this.generateData(payment);
        const signature: string = this.generateSignature(data);

        return {
            data,
            signature,
        }
    }

    /**
     * Verifies if payment data are correct.
     *
     * @param payment - prepared liqpay payment data
     * @returns {void}
     */
    private verifyPaymentData(payment: IPaymentInfo): void {
        if (!payment.version) {
            throw new TypeError(`Version must be specified!`);
        }

        if (!payment.amount) {
            throw new TypeError(`Amount must be specified!`);
        }

        if (!payment.currency) {
            throw new TypeError(`Currency must be specified!`);
        }

        if (!payment.description) {
            throw new TypeError(`Description must be specified!`);
        }
    }

    /**
     * Prepares payment data.
     *
     * @param {IPayload} payload - liqpay payload data
     * 
     * @returns {IPaymentInfo} - prepared data for payment.
     */
    private preparePayment(payload: IPayload): IPaymentInfo {
        const payment: IPaymentInfo = Object.assign<IPaymentInfo, IPayload>({} as any, payload);

        if (!payment.language) {
            payment.language = Language.UA;
        }

        if (this.enableSandbox) {
            payment.sandbox = '1';
        }

        payment.version = this.apiVersion;
        payment.public_key = this.publicKey;

        return payment;
    }

    /**
     * Generates base64 string based on payment data.
     * 
     * @param {IPaymentInfo} paymentData 
     * 
     * @returns {string} - base64 string with encoded payload
     */
    private generateData(paymentData: IPaymentInfo): string {
        return Buffer.from(JSON.stringify(paymentData)).toString('base64');
    }

    /**
     * Generates signature.
     *
     * @param {string} data - base64 string
     * 
     * @returns {string} - signature encoded with SHA1 
     */
    private generateSignature(data: string): string {
        const sha = createHash('sha1');
        sha.update(this.privateKey + data + this.privateKey);

        return sha.digest('base64');
    }
}
