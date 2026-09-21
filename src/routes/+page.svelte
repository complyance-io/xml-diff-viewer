<script>

    // setup the import and state variables
    import { normalizeXML } from '$lib/xmlNormalizer';
    import diffMatchPatch from 'diff-match-patch';
    let originalXml = $state('');
    let modifiedXml = $state('');

    const dmp = new diffMatchPatch();

    // this will re evaulate the when the original or modified xml is changed automatically
    let normalizedOrig = $derived(originalXml ? xmlNormalizer(originalXml) : '');
    let normalizedMod = $derived(modifiedXml ? xmlNormalizer(modifiedXml) : '');

    //  this checks if the normalization produced an error string
    let hasError = $derived(
        normalizedOrig.startsWith('Error') || 
        normalizedOrig.startsWith('Syntax Error') ||
        normalizedMod.startsWith('Error') || 
        normalizedMod.startsWith('Syntax Error')
    );

    // computes the html diff with wysiwyg formatting (should spell it as wizz-eeee-wig 🙂‍↕️)
    let diffResult = $derived.by(() => {
        if (hasError || !originalXml || !modifiedXml) return null;
        
        const diff = dmp.diff_main(normalizedOrig, normalizedMod);
        dmp.diff_cleanupSemantic(diff);
        return dmp.diff_prettyHtml(diff).replaceAll('&para;', '');
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
        <h2>Comparison Output</h2>
        <div class="diff-board">
            {#if diffResult}
                {@html diffResult}
            {:else if !originalXml || !modifiedXml}
                <p class="placeholder-text">Upload both XML files to see the differences.</p>
            {:else}
                {#if !normalizedOrig.startsWith('<')}<p class="alert-text">Original: {normalizedOrig}</p>{/if}
                {#if !normalizedMod.startsWith('<')}<p class="alert-text">Modified: {normalizedMod}</p>{/if}
            {/if}
        </div>
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

    .diff-board {
        white-space: pre-wrap;
        font-family: poppins, sans-serif;
    }
</style>