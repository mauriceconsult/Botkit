export interface PostDeliveryParams {
    pickupAddress: string;
    dropoffAddress: string;
    description?: string;
}
export interface PostDeliveryResult {
    id: string;
    status: string;
}
export declare function postDukabodaDelivery(params: PostDeliveryParams): Promise<PostDeliveryResult>;
