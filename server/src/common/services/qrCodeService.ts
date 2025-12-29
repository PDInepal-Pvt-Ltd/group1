import * as QRCode from "qrcode";
import { uploadMediaurlsOnCloudinary } from "../lib/cloudinary";

export class QrCodeService {
    
    async generateTableQrCode(tableId: string): Promise<string | null> {
        const url = `http://localhost:5173/menu?tableId=${tableId}`; 
        const qrCode = await QRCode.toDataURL(url);
        const qrCodeImage = await uploadMediaurlsOnCloudinary(qrCode);
        return qrCodeImage?.secure_url;
    }
}

export const qrCodeService = new QrCodeService();