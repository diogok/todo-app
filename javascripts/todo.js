var todo = function(){
    var db=null, html= $("#index-page"),curr_list=null;

    try {
        db = new PouchDB('toda',{adapter:'websql'});
    } catch(ex) {
        db = new PouchDB('toda');
    }

    function now() {
         return parseInt(new Date().getTime()/1000);
    }

    function map_lists(doc) {
        if(doc.type == 'list') {
            emit(doc["_id"],doc["name"]);
        }
    }

    function map_items(doc) {
        if(doc.type == "item") {
            emit(doc["list"],doc);
        }
    }

    $("#list ul, #list_options ul").on("click","a.del",function(evt){
        return confirm("Mark this item done?");
    });

    $("#new_list form").submit(function(){
        var name = $("#new_list form input").val().trim();
        if(name.length < 1) return false;
        db.post({type:'list',name:name,timestamp: now()},function(err,res) {});
        $("#new_list form input").val("");
        location.hash="#/lists";
        return false;
    });

    $("#new_item form").submit(function(){
        var content = $("#new_item form input").val().trim();
        if(content.length < 1) return false;
        db.post({type:'item',content:content,list:curr_list,timestamp: now()},function(err,res) {});
        $("#new_item form input").val("");
        location.hash="#/alist/"+curr_list;
        return false;
    });

    Path.map("#/new/list").to(function(){
    });

    Path.map("#/new/item").to(function(){
        $("#new_item a.back").attr("href","#/alist/"+curr_list);
    });

    Path.map("#/options/list").to(function(){
        $("#list_options a.back").attr("href","#/alist/"+curr_list);
    });

    Path.map("#/lists").to(function(){
        $("#lists ul").html("");
        db.query({map:map_lists},{reduce:false},function(err,res){
            if(res.rows.length < 1) {
                $("#lists ul").append("<li><a href='#/new/list'>You have no list yet...</a></li>");
            } else {
                for(var i in res.rows) {
                    var id = res.rows[i].key, name=res.rows[i].value;
                    var li = '<li><a href="#/alist/'+id+'"> '+name+' <i class="icon-arrow-right"></i></a></li>'
                    $("#lists ul").append(li);
                }
            }
        });
    });

    Path.map("#/alist/:list").to(function(){
        db.get(this.params["list"],function(err,list){
            curr_list = list["_id"];
            $("#list h2 span").text(list.name);
            db.query({map:map_items},{reduce:false},function(err,res){
                $("#list ul").html("");
                var rows = res.rows.filter(function(r) { return r.key === curr_list ;}).map(function(r) { return r.value;});
                if(rows.length < 1) {
                    $("#list ul").append("<li>You have no item here yet...</li>");
                } else {
                    for(var i  in rows) {
                        var content=rows[i].content,id=rows[i]["_id"];
                        $("#list ul").append("<li><span>"+content+"</span><a href='#/del/item/"+id+"' class='del'><i class='icon-check'></i></a></li>")
                    }
                }
            });
        });
    });

    Path.map("#/del/item/:id").to(function(){
        db.get(this.params["id"],function(err,doc){
            db.remove(doc,function(err,res) {
                location.hash="#/alist/"+curr_list;
            });
        })
    });

    Path.map("#/del/list").to(function(){
        db.get(curr_list,function(err,doc){
            db.remove(doc,function(err,res) {
                location.hash="#/lists";
            });
        })
    });

    location.hash="#/lists";
    html.attr("id","lists-page");

    Path.listen();

    var oldFn = window.onhashchange ;
    window.onhashchange = function() {
        if(location.hash.replace("#","").replace("/","") == '') {
            location.hash = '#/lists';
        } else {
            html.attr("id",location.hash.substring(2).replace("_","-").replace("/","-")+'-page');
            oldFn();
        }
    };


    return todo;
};
