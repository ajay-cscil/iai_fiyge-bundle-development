// ----------------------------------------------------------------------------
// markItUp!
// ----------------------------------------------------------------------------
// Copyright (C) 2008 Jay Salvat
// http://markitup.jaysalvat.com/
// ----------------------------------------------------------------------------
// BBCode tags example
// http://en.wikipedia.org/wiki/Bbcode
// ----------------------------------------------------------------------------
// Feel free to add more tags
// ----------------------------------------------------------------------------
mySettings = {
    previewParserPath:	'', 
    markupSet: [
    {
        name:'Bold', 
        key:'B', 
        openWith:'[b]', 
        closeWith:'[/b]'
    },

    {
        name:'Italic', 
        key:'I', 
        openWith:'[i]', 
        closeWith:'[/i]'
    },

    {
        name:'Underline', 
        key:'U', 
        openWith:'[u]', 
        closeWith:'[/u]'
    },

    {
        separator:'---------------'
    },
    {
        name:'Picture', 
        key:'P', 
        replaceWith:'[img][![Url]!][/img]'
    },

    {
        name:'Link', 
        key:'L', 
        openWith:'[url=[![Url]!]]', 
        closeWith:'[/url]', 
        placeHolder:'Your text to link here...'
    },

    {
        separator:'---------------'
    },
    {
        name:'Size', 
        key:'S', 
        openWith:'[size=[![Text size]!]]', 
        closeWith:'[/size]',
        dropMenu :[
        {
            name:'Big', 
            openWith:'[size=200]', 
            closeWith:'[/size]'
        },
        {
            name:'Normal', 
            openWith:'[size=100]', 
            closeWith:'[/size]'
        },
        {
            name:'Small', 
            openWith:'[size=50]', 
            closeWith:'[/size]'
        }
        ]
    },

    {
        separator:'---------------'
    },
    {
        name:'Bulleted list', 
        openWith:'[list]\n', 
        closeWith:'\n[/list]'
    },

    {
        name:'Numeric list', 
        openWith:'[list=[![Starting number]!]]\n', 
        closeWith:'\n[/list]'
    },

    {
        name:'List item', 
        openWith:'[*] '
    },

    {
        separator:'---------------'
    },
    {
        name:'Quotes', 
        openWith:'[quote]', 
        closeWith:'[/quote]'
    },

    {
        name:'Code', 
        openWith:'[code]', 
        closeWith:'[/code]'
    },

    {
        separator:'---------------'
    },
    {
        name:'Clean', 
        className:"clean", 
        replaceWith:function(markitup) {
            return markitup.selection.replace(/\[(.*?)\]/g, "")
        }
    },
    {
        name:'Preview', 
        className:"preview", 
        call:'preview'
    },
    {
        name:'Document',
        className:"sprite sprite-page_white_add",
        replaceWith:'[document][![document id]!][/document]'
    },
    {
        name:'Page Break',
        className:"sprite sprite-page_white_copy",
        replaceWith:'[page-break]'
    },
    {
        name:'PHP',
        className:"php", 
        openWith:'[php]', 
        closeWith:'[/php]'
    },
    {
        name:'xhtml',
        className:"sprite sprite-html", 
        openWith:'[xhtml]', 
        closeWith:'[/xhtml]'
    },

    {
        name:'text_heading_1',
        className:"sprite sprite-text_heading_1", 
        openWith:'[h1]', 
        closeWith:'[/h1]'
    },
    {
        name:'text_heading_2',
        className:"sprite sprite-text_heading_2", 
        openWith:'[h2]', 
        closeWith:'[/h2]'
    },
    {
        name:'text_heading_3',
        className:"sprite sprite-text_heading_3", 
        openWith:'[h3]', 
        closeWith:'[/h3]'
    },
    {
        name:'text_heading_4',
        className:"sprite sprite-text_heading_4", 
        openWith:'[h4]', 
        closeWith:'[/h4]'
    },
    {
        name:'text_heading_5',
        className:"sprite sprite-text_heading_5", 
        openWith:'[h5]', 
        closeWith:'[/h5]'
    },
    {
        name:'text_heading_6',
        className:"sprite sprite-text_heading_6", 
        openWith:'[h6]', 
        closeWith:'[/h6]'
    },
    ]
};