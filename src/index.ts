import {
    grayscale,
    PDFDocument,
    PDFPage,
    popGraphicsState,
    pushGraphicsState,
    rgb,
    setCharacterSpacing,
} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import {render as renderQR} from 'qr-svg'
import {
    Checksum256,
    Checksum256Type,
    TimePointSec,
    TimePointType,
    UInt32,
    UInt32Type,
} from '@greymass/eosio'
import {KeyCertificate} from '@greymass/keycert'

const black = grayscale(0)
const blue = rgb(0.3098039216, 0.3294117647, 0.6156862745)

export interface ChainState {
    head_block_id: Checksum256Type
    head_block_num: UInt32Type
    head_block_time: TimePointType
}

export interface Arguments {
    /** The key certificate instance to render. */
    cert: KeyCertificate
    /**
     * Base PDF template, can be a path where the file will be loaded from or
     * an ArrayBuffer containing the already loaded bytes. If omitted it will
     * loaded using the fs module from the package.
     */
    template?: string | ArrayBuffer
    /**
     * Font used to render information, ArrayBuffer with font data or path to
     * font, if omitted will be loaded using the fs module from the package.
     */
    font?: string | ArrayBuffer
    /**
     * Chain info for the certificate footer, compatible with the response
     * from a nodeos /v1/chain/get_info call.
     */
    state: ChainState
}

export default async function generate(args: Arguments) {
    const {cert, state} = args

    const templateData = await loadBytes(args.template || __dirname + '/template.pdf')
    const fontData = await loadBytes(args.font || __dirname + '/font.otf')

    const doc = await PDFDocument.load(templateData)
    doc.registerFontkit(fontkit)

    const font = await doc.embedFont(fontData)
    const page = doc.getPages()[0]

    drawQR(page, {x: 90, y: 410}, 124, cert.toString())

    page.drawText(String(cert.account.actor), {x: 388, y: 502, size: 9, font})
    page.drawText(networkName(cert.chainId), {x: 234, y: 502, size: 9, font})

    const keyStr = String(cert.key)
    const keySpacing = 1
    const keyX = 306 - (font.widthOfTextAtSize(keyStr, 7) + keyStr.length * keySpacing) / 2
    page.pushOperators(pushGraphicsState(), setCharacterSpacing(keySpacing))
    page.drawText(keyStr, {x: keyX, y: 573, size: 7, font})
    page.pushOperators(popGraphicsState())

    const sx = 90
    const sy = 343
    const h = 20
    const pr = 4
    const w = 70 + 51
    for (const [i, word] of cert.toMnemonic().key.entries()) {
        const x = sx + w * (i % pr)
        const y = sy - h * Math.floor(i / pr)
        page.drawText(`${i + 1}. `.padStart(4, ' '), {x, y, size: 9, font, color: blue})
        page.drawText('    ' + word, {x, y, size: 9, font})
    }

    const headTime = TimePointSec.from(state.head_block_time)
    const headNum = UInt32.from(state.head_block_num)
    const headId = Checksum256.from(state.head_block_id)
    const footer = `Issued ${headTime} at block height ${headNum} - ${headId}`
    const footerX = 306 - font.widthOfTextAtSize(footer, 6) / 2
    page.drawText(footer, {x: footerX, y: 71, size: 6, font, color: blue})

    return doc.save()
}

async function loadBytes(from: string | ArrayBuffer) {
    if (from instanceof ArrayBuffer) {
        return from
    } else {
        const fs = await import('fs/promises')
        const data = await fs.readFile(from)
        return data.buffer
    }
}

function drawQR(page: PDFPage, pos: {x: number; y: number}, size: number, text: string) {
    const qr = renderQR(text, 'Q')
    const f = size / qr.size
    for (const {x, y, width, height} of qr.rects) {
        page.drawRectangle({
            x: pos.x + x * f,
            y: pos.y + y * f,
            width: width * f,
            height: height * f,
            color: black,
        })
    }
}

function networkName(chainId: Checksum256) {
    switch (String(chainId)) {
        case 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906':
            return 'EOS'
        case '21dcae42c0182200e93f954a074011f9048a7624c6fe81d3c9541a614a88bd1c':
            return 'FIO'
        case 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e':
            return 'FIO (Testnet)'
        case 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473':
            return 'Jungle 2 (Testnet)'
        case '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840':
            return 'Jungle 3 (Testnet)'
        case 'b62febe5aadff3d5399090b9565cb420387d3c66f2ccd7c7ac1f532c4f50f573':
            return 'Lynx'
        case 'f11d5128e07177823924a07df63bf59fbd07e52c44bc77d16acc1c6e9d22d37b':
            return 'Lynx (Testnet)'
        case '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11':
            return 'Telos'
        case '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f':
            return 'Telos (Testnet)'
        case '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4':
            return 'WAX'
        case 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12':
            return 'WAX (Testnet)'
        case 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f':
            return 'Block.one Testnet'
        case '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0':
            return 'PROTON'
        case '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd':
            return 'PROTON (Testnet)'
    }
    return 'UNKNOWN'
}
