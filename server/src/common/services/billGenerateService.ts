import { BillResponse } from "@/api/bill/billModel";
import PDFDocument from "pdfkit";
import { createCloudinaryUploadStream } from "../lib/cloudinary";
import QRCode from "qrcode";

export class BillGenerateService {
    async generateBill(billData: BillResponse): Promise<{ pdfUrl: string }> {
        const { stream, promise } = createCloudinaryUploadStream({
            folder: "bills",
            public_id: `bill_${billData.id}_${Date.now()}`,
            resource_type: "image", 
            format: "pdf",
        });

        const doc = new PDFDocument({
            size: "A4",
            margins: { top: 40, bottom: 50, left: 50, right: 50 },
            compress: true,
        });

        doc.pipe(stream);

        // --- 1. BRANDING ---
        const logoUrl = "https://res.cloudinary.com/deqqyvw75/image/upload/v1766302906/pap76nxxhnnx91tgjbfn.png";
        try {
            const resp = await fetch(logoUrl);
            const logoBuffer = Buffer.from(await resp.arrayBuffer());
            doc.image(logoBuffer, 50, 45, { width: 60 });
        } catch (e) { /* silent fail */ }

        doc.fillColor("#1a1a1a").font("Helvetica-Bold").fontSize(22).text("RESTAURANT QRIFY", 120, 50);
        doc.fontSize(9).font("Helvetica").fillColor("#777").text("123 Gourmet Street, Food City, NY 10001", 120, 75);

        // --- 2. BILL INFO ---
        doc.rect(50, 110, 495, 40).fill("#fbfbfb");
        doc.fillColor("#444").font("Helvetica-Bold").fontSize(10);
        doc.text("INVOICE TO:", 65, 120);
        doc.text("BILL DETAILS:", 350, 120);
        doc.font("Helvetica").fillColor("#000");
        doc.text(`Guest / Table: ${billData.order.tableId || 'Walk-in'}`, 65, 132);
        doc.text(`ID: #${billData.id.slice(0, 8)}`, 350, 132);
        doc.text(`Date: ${new Date(billData.generatedAt).toLocaleString()}`, 350, 142);

        // --- 3. TABLE HEADER ---
        const tableTop = 170;
        doc.rect(50, tableTop, 495, 20).fill("#333");
        doc.fillColor("#fff").font("Helvetica-Bold").fontSize(10);
        doc.text("ITEM DESCRIPTION", 65, tableTop + 6);
        doc.text("QTY", 300, tableTop + 6, { width: 30, align: 'center' });
        doc.text("TOTAL", 460, tableTop + 6, { width: 70, align: 'right' });

        // --- 4. ITEMS LIST ---
        let currentY = tableTop + 25;
        doc.fillColor("#333").font("Helvetica");

        billData.order.items.forEach((item, i) => {
            // Check if items are hitting the bottom margin
            if (currentY > 750) {
                doc.addPage();
                currentY = 50;
            }
            if (i % 2 === 0) doc.rect(50, currentY - 5, 495, 20).fill("#fdfdfd");
            doc.fillColor("#333").text(item.menuItem.name, 65, currentY);
            doc.text(item.qty.toString(), 300, currentY, { width: 30, align: 'center' });
            doc.text(`$${item.subTotal.toFixed(2)}`, 460, currentY, { width: 70, align: 'right' });
            currentY += 20;
        });

        // --- 5. DYNAMIC SUMMARY & QR ---
        currentY += 30;

        // CRITICAL FIX: If we don't have enough room for the summary + footer (approx 200px), 
        // move to the next page now to avoid splitting the totals.
        if (currentY > 650) {
            doc.addPage();
            currentY = 50;
        }

        const summaryX = 350;
        const qrData = `https://qrify.com/pay/${billData.id}`;
        const qrBuffer = await QRCode.toBuffer(qrData, { margin: 1, width: 75 });
        doc.image(qrBuffer, 50, currentY); 
        doc.fontSize(8).fillColor("#777").text("Scan to pay or leave a review", 50, currentY + 80);

        const drawRow = (label: string, value: string, isBold = false) => {
            doc.font(isBold ? "Helvetica-Bold" : "Helvetica").fillColor("#333").fontSize(10);
            doc.text(label, summaryX, currentY);
            doc.text(value, 460, currentY, { width: 70, align: 'right' });
            currentY += 18;
        };

        drawRow("Subtotal", `$${billData.subTotal.toFixed(2)}`);
        drawRow(`Tax (${billData.taxPct}%)`, `$${billData.taxAmount.toFixed(2)}`);
        
        doc.rect(summaryX - 10, currentY - 5, 205, 30).fill("#f4f4f4");
        currentY += 7;
        doc.fillColor("#d32f2f").font("Helvetica-Bold").fontSize(12);
        doc.text("GRAND TOTAL", summaryX, currentY);
        doc.text(`$${billData.grandTotal.toFixed(2)}`, 460, currentY, { width: 70, align: 'right' });

        // --- 6. DYNAMIC FOOTER ---
        // Position footer relative to currentY, but with a minimum distance from bottom
        currentY += 50; 
        
        const instaIcon = "https://cdn-icons-png.flaticon.com/512/174/174855.png";
        const fbIcon = "https://cdn-icons-png.flaticon.com/512/124/124010.png";

        try {
            const [instaResp, fbResp] = await Promise.all([fetch(instaIcon), fetch(fbIcon)]);
            const instaBuf = Buffer.from(await instaResp.arrayBuffer());
            const fbBuf = Buffer.from(await fbResp.arrayBuffer());

            const centerX = (doc.page.width / 2) - 45;
            doc.image(instaBuf, centerX, currentY, { width: 12 });
            doc.fontSize(8).fillColor("#777").text("@restaurant_qrify", centerX + 15, currentY + 3);
            
            doc.image(fbBuf, centerX + 90, currentY, { width: 12 });
            doc.text("/restaurantqrify", centerX + 105, currentY + 3);
        } catch (e) { /* fallback */ }

        doc.fontSize(10).fillColor("#333").font("Helvetica-Oblique")
           .text("Thank you for choosing Restaurant QRIFY!", 50, currentY + 25, { align: 'center' });

        doc.end();
        const result = await promise;
        return { pdfUrl: result.secure_url };
    }
}

export const billGenerateService = new BillGenerateService();