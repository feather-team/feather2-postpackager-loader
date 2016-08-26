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

    info.threeUrls.bottomJs.forEach(function(script){
        bottom += '<script src="' + script + '"></script>';
    });

    return {
        head: head,
        bottom: bottom
    }
}

module.exports = function(ret){
    var options = {}, autoPack = feather.config.get('autoPack.type');

    if(autoPack == 'combo'){
        options.combo = feather.config.get('autoPack.options');
    }

    var ResourceObject = new Resource(ret.map, options);

    feather.util.map(ret.src, function(subpath, file){
        if(file.isHtmlLike){
            var id = file.id;
            var info = ResourceObject.getResourceInfo(id), content = file.getContent();

            if(!isEmpty(info.requires.map)){
                var mapFile = feather.file.wrap(feather.project.getProjectPath() + '/static/m_/' + feather.util.md5(subpath, 7) + '.js');
                mapFile.setContent('require.config(' + JSON.stringify(info.requires) + ');');
                ret.pkg[mapFile.subpath] = mapFile;
                info.threeUrls.headJs.push(mapFile.getUrl());
            }

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
                content = content.replace(/\/\*PAGELET_ASYNCS_PLACEHOLDER:[\s\S]+?\*\//, (
                    JSON.stringify(info.pageletAsyncs) || '').slice(1, -1));
            }

            file.setContent(content);
            ret.pkg[subpath] = file;
        }
    });
}; 
