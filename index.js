var Resource = require('feather2-resource');

function isEmpty(obj){
    for(var i in obj){
        return false;
    }

    return true;
}

function joinSrc(info){
    var head = '', bottom = '';

    info.threeUrls.css.forEach(function(link){
        head += '<link rel="stylesheet" href="' + link + '" type="text/css" />';
    });

    info.threeUrls.headJs.forEach(function(script){
        head += '<script src="' + script + '"></script>';
    });

    if(!isEmpty(info.requires.map)){
        head += '<script>require.config(' + JSON.stringify(info.requires) + ')</script>';
    }

    info.threeUrls.bottomJs.forEach(function(script){
        bottom += '<script src="' + script + '"></script>';
    });

    return {
        head: head,
        bottom: bottom
    }
}

module.exports = function(ret){
    var options = {}, combo = feather.config.get('combo');

    if(combo.use){
        delete combo.use;
        options.combo = combo;
    }

    Resource.init(ret.map, options);

    feather.util.map(ret.ids, function(id, file){
        if(file.isHtmlLike && !file.isWidget){
            var info = Resource.getResourceInfo(id), content = file.getContent();
            var srcs = joinSrc(info);

            if(/<\/head>/.test(content)){
                content = content.replace(/<\/head>/, function(all){
                    return srcs.head + all;
                });
            }else{
                content = srcs.head + content;
            }

            if(/<\/body>/.test(content)){
                content = content.replace(/<\/body>/, function(all){
                    return srcs.bottom + all;
                });
            }else{
                content = srcs.bottom + content;
            }

            if(file.isPagelet){
                content = content.replace(/"##PLACEHOLDER_PAGELET_ASYNCS:[\s\S]+?##"/, JSON.stringify(info.pageletAsyncs));
            }

            file.setContent(content);
        }
    });
}; 