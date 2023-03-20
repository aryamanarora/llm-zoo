const parseDate = d3.timeParse("%B %d, %Y");

function clean(data, split=false) {

    // split different param sizes into their own entries
    if (split) {
        new_data = []
        data.forEach(function(d) {
            if (Array.isArray(d.parameters)) {
                d.parameters.forEach(p => {
                    new_d = JSON.parse(JSON.stringify(d))
                    new_d.parameters = p
                    new_data.push(new_d)
                })
            }
            else {
                new_data.push(d)
            }
        })

        data = new_data
    }

    // clean data columns
    data.forEach(function(d) {

        d.name = d.name + ('tags' in d ? (d.tags.includes('non-transformer') ? '*' : '') : '')

        // parse dates
        d.announced = {
            display: d.announced,
            parsed: parseDate(d.announced).valueOf()
        }

        // parse model sizes
        d.params_old = d.parameters
        if (Array.isArray(d.parameters)) {
            d.parameters = d.parameters[0]
            d.params_old = d.params_old.join(', ')
        }
        if (d.parameters.slice(-1) === 'B') {
            d.parameters_parsed = parseFloat(d.parameters.slice(0, -1)) * 1E9
        }
        else if (d.parameters.slice(-1) === 'M') {
            d.parameters_parsed = parseFloat(d.parameters.slice(0, -1)) * 1E6
        }
        else d.parameters_parsed = 0.0

        d.params = {
            display: d.params_old + ('tags' in d ? (d.tags.includes('MoE') ? '<sup>MoE</sup>' : '') : ''),
            parsed: d.parameters_parsed
        }

        if (Array.isArray(d.languages)) {
            d.languages_parsed = d.languages.join(" + ")
        }
        else if (typeof d.languages === "object") {
            if ('human' in d.languages) d.languages_parsed = `Multilingual<sup>${d.languages.human}</sup> + Code<sup>${d.languages.code}</sup>`
            else d.languages_parsed = `Code<sup>${d.languages.code}</sup>`
        }
        else if (!isNaN(parseInt(d.languages))) {
            d.languages_parsed = `Multilingual<sup>${d.languages}</sup>`
        }
        else d.languages_parsed = d.languages

        if (Array.isArray(d.creator)) d.creator_parsed = d.creator.join(", ")
        else d.creator_parsed = d.creator

        if (Array.isArray(d.trained_on)) {
            d.trained_on_parsed = d.trained_on.join(", ")
        }
        else if ('finetuning' in d) d.trained_on_parsed = '<sup>FT</sup>' + d.finetuning
        else if ('rlhf' in d) d.trained_on_parsed = '<sup>RLHF</sup>' + d.rlhf
        else if (!('trained_on' in d)) d.trained_on_parsed = "?"
        else d.trained_on_parsed = d.trained_on
        
        if (typeof d.references === "object") {
            d.references_parsed = '<ul>'
            if ('arxiv' in d.references) {
                d.references_parsed += `<li><a href="https://arxiv.org/abs/${d.references.arxiv}" target="_blank"><i class="ai ai-arxiv"></i>&nbsp;${d.references.arxiv}</a></li>`
            }
            if ('github' in d.references) {
                d.references_parsed += `<li><a href="https://github.com/${d.references.github}" target="_blank"><i class="fa-brands fa-github"></i>&nbsp;${d.references.github}</a></li>`
            }
            if ('url' in d.references) {
                d.references_parsed += `<li><a href="${d.references.url}" target="_blank"><i class="fa fa-solid fa-link"></i>&nbsp;Link</a></li>`
            }
            if ('huggingface' in d.references) {
                d.references_parsed += `<li><a href="https://huggingface.co/${d.references.huggingface}" target="_blank">🤗&nbsp;${d.references.huggingface}</a></li>`
            }
            d.references_parsed += '</ul>'
        }
        else d.references_parsed = ''
    });

    return data
}