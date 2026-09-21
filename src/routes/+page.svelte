<script>

    // setup the import and state variables
    import { xmlNormalizer } from '$lib/xmlNormalizer';
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

    // computes the html diff
    let diffResult = $derived.by(() => {
        if (hasError || !originalXml || !modifiedXml) return null;
        
        const diff = dmp.diff_main(normalizedOrig, normalizedMod);
        dmp.diff_cleanupSemantic(diff);
        return dmp.diff_prettyHtml(diff);
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