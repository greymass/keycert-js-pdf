import 'mocha'
import {KeyCertificate} from '@greymass/keycert'
import {strict as assert} from 'assert'

import generate, {ChainState} from '../src'

let savePdf = false
if (typeof process !== 'undefined' && process.env) {
    savePdf = !!process.env.SAVE_PDF
}

suite('index', function () {
    test('generate', async function () {
        const cert = KeyCertificate.from(
            'anchorcert:KgKgBT5ajPc6VroP2hHk2S4COKSiqnT8z0bVqRB0aEAAJANs0sSmSwAAAACAqyanAER8IsLg2SvYygVCJ1oC8OBfv4IQnP2lL1ygTly0bkvLpJbOVL4'
        )
        const state: ChainState = {
            head_block_id: '17e117288642879110850b62f83cb13d07e7961e321c1c762ff5e5ab83029c7c',
            head_block_num: 123456790,
            head_block_time: new Date(),
        }
        const doGenerate = async () => {
            const pdf = await generate({cert, state, versionInfo: 'Test suite 1.2.3'})
            if (savePdf) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                require('fs').writeFileSync('test.pdf', pdf)
            }
        }

        await assert.doesNotReject(doGenerate())
    })
})
