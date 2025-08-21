import { QRCodeCanvas } from "qrcode.react";

export default function QRCode({ user, link }) {
    return (
        <div>
             <QRCodeCanvas value={link} size={200} />;
        </div>
    );
}
