export interface PostAnnouncementParams {
    classId: string;
    title: string;
    content: string;
}
export interface PostAnnouncementResult {
    id: string;
    status: string;
}
export declare function postInstaskulAnnouncement(params: PostAnnouncementParams): Promise<PostAnnouncementResult>;
