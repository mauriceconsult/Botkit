export interface PostListingParams {
    title: string;
    description: string;
    price: number;
    category?: string;
}
export interface PostListingResult {
    id: string;
    status: string;
}
export declare function postZuriaListing(params: PostListingParams): Promise<PostListingResult>;
