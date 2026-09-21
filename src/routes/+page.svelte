<script>

    // setup the import and state variables
    import { normalizeXML } from '$lib/xmlNormalizer';
    import diffMatchPatch from 'diff-match-patch';
    let originalXml = $state('');
    let modifiedXml = $state('');

    const dmp = new diffMatchPatch();

    // this will re evaulate the when the original or modified xml is changed automatically
    let normalizedOrig = $derived(originalXml ? normalizeXML(originalXml) : '');
    let normalizedMod = $derived(modifiedXml ? normalizeXML(modifiedXml) : '');

    //  this checks if the normalization produced an error string
    let hasError = $derived(
        normalizedOrig.startsWith('Error') || 
        normalizedOrig.startsWith('Syntax Error') ||
        normalizedMod.startsWith('Error') || 
        normalizedMod.startsWith('Syntax Error')
    );

    // computes the html diff with wysiwyg formatting (should spell it as wizz-eeee-wig 🙂‍↕️)
    let rows = $derived.by(() => {
        if (hasError || !originalXml || !modifiedXml) return [];

        const a = dmp.diff_linesToChars_(normalizedOrig, normalizedMod);
        const diff = dmp.diff_main(a.chars1, a.chars2, false);
        dmp.diff_charsToLines_(diff, a.lineArray);

        const out = [];
        let oldNo = 1;
        let newNo = 1;
        for (const [op, text] of diff) {
            for (const line of text.replace(/\n$/, '').split('\n')) {
                if (op === 0) out.push({ sign: '', oldNo: oldNo++, newNo: newNo++, line });
                if (op === -1) out.push({ sign: '-', oldNo: oldNo++, newNo: '', line });
                if (op === 1) out.push({ sign: '+', oldNo: '', newNo: newNo++, line });
            }
        }
        return out;
    });

    // this function handles the file upload
    function handleFileupload(event, target) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (target === 'original') originalXml = e.target.result;
            else modifiedXml = e.target.result;
        };
        reader.readAsText(file);
    }
</script>

<main class="app">
    <section class="file-upload">
        <label>
            Original XML
            <input type="file" accept=".xml" onchange={(e) => handleFileupload(e, 'original')} />
        </label>
        <label>
            Modified XML
            <input type="file" accept=".xml" onchange={(e) => handleFileupload(e, 'modified')} />
        </label>
    </section>
    <section class="results-view">
        {#if rows.length}
            <p class="summary">
                <span class="plus">+{rows.filter((r) => r.sign === '+').length}</span> /
                <span class="minus">-{rows.filter((r) => r.sign === '-').length}</span> /
                {rows.filter((r) => r.sign === '').length} unchanged
            </p>
            <h2>Diff Result</h2>
            <div class="diff-board">
                {#each rows as row}
                    <div class="row" class:minus={row.sign === '-'} class:plus={row.sign === '+'}>
                        <span class="num">{row.oldNo}</span>
                        <span class="num">{row.newNo}</span>
                        <span class="sign">{row.sign}</span>
                        <span class="code">{row.line}</span>
                    </div>
                {/each}
            </div>
        {:else if !originalXml || !modifiedXml}
            <p class="placeholder-text">Upload both XML files to see the differences.</p>
        {:else}
            {#if !normalizedOrig.startsWith('<')}<p class="alert-text">Original: {normalizedOrig}</p>{/if}
            {#if !normalizedMod.startsWith('<')}<p class="alert-text">Modified: {normalizedMod}</p>{/if}
        {/if}
    </section>
</main>

<style>
    .app {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
    }

    .file-upload {
        display: flex;
        gap: 2rem;
    }

    .results-view {
        width: 100%;
        max-width: 900px;
    }

    .summary .plus {
        color: green;
    }

    .summary .minus {
        color: red;
    }

    .diff-board {
        border: 1px solid #999;
        font-family: monospace;
    }

    .row {
        display: grid;
        grid-template-columns: 3rem 3rem 2rem 1fr;
    }

    .num {
        text-align: right;
        padding-right: 0.5rem;
        color: #666;
    }

    .code {
        white-space: pre-wrap;
    }

    .row.minus {
        background: #ffe6e6;
    }

    .row.plus {
        background: #e6ffe6;
    }
</style>