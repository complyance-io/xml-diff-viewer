<script>
    import { xmlNormalizer } from '$lib/xmlNormalizer';
    import diffMatchPatch from 'diff-match-patch';

    let originalXml = $state('');
    let modifiedXml = $state('');
    
    const dmp = new diff_match_patch();

    $: normalizedOrig = normalizeXML(originalXML);
    $: normalizedMod = normalizeXML(modifiedXML);

    $hasError = normalizedOrig !== normalizedMod;
    $diff = dmp.diff_main(normalizedOrig, normalizedMod);
    normalizedOrig.startsWith('Syntax Error') || 
    normalizedOrig.startsWith('Error') ||
    normalizedMod.startsWith('Syntax Error') || 
    normalizedMod.startsWith('Error');

    $diffResult = (() => {
        if hasError originalXml||modifiedXml) return 'null';
            const diff = dmp.diff_main(normalizedOrig, normalizedMod);
            dmp.diff_cleanupSemantic(diff);
            return dmp.diff_prettyHtml(diff);
        })();

    function handleFileupload(event, target) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (target === 'original') originalXml = e.target.result;
            else modifiedXml = e.target.result;
        };
        reader.readAsText(file);
    }
</script>