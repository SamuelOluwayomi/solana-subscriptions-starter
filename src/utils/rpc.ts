import { Connection } from '@solana/web3.js';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a Connection and verify the RPC is responsive by calling getVersion.
 * Retries a few times with exponential backoff before throwing.
 */
export async function createConnectionWithRetry(url?: string, attempts = 3, initialDelay = 500) {
    const rpc = url || process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rpc.ts:12',message:'createConnectionWithRetry called',data:{rpc,url,envVar:process.env.NEXT_PUBLIC_RPC_URL||'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    let lastErr: any = null;
    for (let i = 0; i < attempts; i++) {
        try {
            const conn = new Connection(rpc, 'confirmed');
            // Quick health check
            await conn.getVersion();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rpc.ts:19',message:'Connection health check passed',data:{rpc,attempt:i+1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            return conn;
        } catch (e: any) {
            lastErr = e;
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rpc.ts:24',message:'Connection attempt failed',data:{rpc,attempt:i+1,error:e?.message||String(e),errorType:e?.name||'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const delay = initialDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
    // Final attempt without catching to surface the error
    if (lastErr) throw lastErr;
    return new Connection(rpc, 'confirmed');
}

export function getDefaultRpcUrl() {
    return process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
}
