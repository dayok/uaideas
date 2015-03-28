$(document).ready(function() {

    var expires = new Date();
    expires.setTime(expires.getTime() - (7 * 24 * 60 * 60 * 1000));
    document.cookie =  'USER_OFF=' + null + ';expires=' + expires.toUTCString();

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }


    var mail = readCookie("USER_IN")
    var is_confirmed;
    var loggedUserName;
    var user_id;
    var is_banned;
    var liked_ideas;
    var created_ideas;

    function getUser(userId, userMail) {
        var dataGetUserStatus = "user_id=" + userId + "&email=" + userMail + "&ban=0";

        var getUserStatus = $.ajax({
            type: "GET",
            url: "api/users.php",
            data: dataGetUserStatus,
            async: false,
            dataType: 'json',
            status: 200,
            statusText: "OK",
            cache: false
        });

        getUserStatus.done(function(datas) {
            var user = datas['0'];
            if(user['is_confirmed'] == "1") {
                is_confirmed = true;
            }
            else {
                is_confirmed = false;
            }
            loggedUserName = user['name'];
            user_id = user['id'];
            liked_ideas = user['liked_ideas'];
            created_ideas = user['created_ideas'];
            var ban = user['is_banned'];

            if(ban == 1){
                is_banned = true;
            }
            else{
                is_banned = false;
            }
        });
    }

    getUser("", mail);

    if (!is_confirmed) {
        $("#top-panel-menu td:nth-child(2)").append('<img src="img/alert.png" style="height: 7%; width: auto; display: inline-block; cursor: pointer"/>');
    }
    else if(is_banned){
        $("#top-panel-menu td:nth-child(2)").append('<img src="img/alert.png" style="height: 7%; width: auto; display: inline-block; cursor: pointer"/>');
    }

    /*
    Clear city on select of new region
     */
    var content = $("#list-ideas-content");
    var limitIndex = $("#load-another-content");
    var limitCount = 10;

    content.empty();
    limitIndex.attr("index", "0");
    searchIdeas(0, "");

    $("#region-select").change(function(){
        var cityName = $("#search-city");
        cityName.val("");
        });

    /*
    Logout
     */
    $("#logout-link").click(function () {
        window.location = "index.php";
        var expires = new Date();
        expires.setTime(expires.getTime() - (7 * 24 * 60 * 60 * 1000));
        document.cookie =  'USER_IN=' + null + ';expires=' + expires.toUTCString();

        var expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie =  'USER_OFF=' + null + ';expires=' + expires.toUTCString();
    });

    /*
    Retrieve ideas
     */

    function searchIdeas(limit, userId, dataString){
        var regionId = $("#region-select").find(":selected").index();
        var cityName = $("#search-city").val();
        var categoryId = $("#category-select").find(":selected").index();
        var sortId = $("#sort-select").find(":selected").index();

        var dataGetCityId = "region_id=" + regionId + "&city_name=" + cityName;

        var getCity = $.ajax({
            type: "GET",
            url: "api/city.php",
            data: dataGetCityId,
            dataType: 'json',
            async: false,
            status: 200,
            statusText: "OK",
            cache: false
        });

        getCity.done(function (datas) {
            var cityId = datas['city_id'];
            if(cityId == null) {
                cityId = "";
            }
            var dataGetIdeas = "";
            if(dataString == undefined) {
                dataGetIdeas = "region_id=" + regionId + "&city_id=" + cityId + "&user_id=" + userId + "&category_id=" + categoryId + "&sort_by="
                    + sortId + "&limit=" + limitIndex.attr("index") + "," + limitCount;
            }
            else{
                dataGetIdeas = dataString;
            }
            limitIndex.attr("index", String(parseInt(limit) + parseInt(limitCount)));

            var getIdeas = $.ajax({
                type: "GET",
                url: "api/ideas.php",
                data: dataGetIdeas,
                dataType: 'json',
                status: 200,
                async: false,
                statusText: "OK",
                cache: false
            });
            getIdeas.done(function (datas) {
                if (datas['count'] == 0) {
                    $("#load-another-content").attr("disabled", "true");
                    $("#no-ideas-text").remove();
                    $("#ideas-content").append("<br><br><div id='no-ideas-text' style='width: 90%; margin-left: 5%; text-align: center; font-family:  tahoma, arial, verdana, sans-serif, \"Lucida Sans\";'>Більше не знайдено жодної ідеї чи проблеми.<div>");
                }
                else {
                    $("#load-another-content").removeAttr("disabled");
                    var ideas = datas['0'];
                    for (var i = 0; i < ideas.length; i++) {
                        content.append(
                            "<li index=\"" + ideas[i]['id'] +"\">" +
                                "<div class=\"left-side-block\">" +
                                "<div class=\"image-ideas-item\">" +
                                "</div>" +
                                "<span class=\"info-ideas-item\"><img src=\"img/like1.png\" class=\"like-icon\"> <span class=\"info-ideas-item-like\">" + ideas[i]['rating'] + "</span><br><br> <span style=\"color: darkgrey; font-size: 12px\">від " + ideas[i]['date'] + "</span></span>" +
                                "<span class=\"id-ideas-item\"></span>" +
                                "</div>" +
                                "<div class=\"right-side-block\">" +
                                "<span class=\"subject-ideas-item\"><br>" +
                                ideas[i]['subject'].substring(0,30) +
                                "</span>" +
                                "<br> <br>" +
                                "<span class=\"description-ideas-item\">" +
                                ideas[i]['description'].replace(/\(AND\)/g,"&").substring(0,40) +
                                "...</span> </div> " +
                            "</li>");
                    }
                }

            });


        });
    }



    /*
    Perform search
     */

    $("#search-submit").click(function () {
        content.empty();
        limitIndex.attr("singleuser", "false");
        limitIndex.attr("index", "0");
        searchIdeas(0, "");
    });



    /*
    Load content on scroll
     */

    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            if(limitIndex.attr("singleuser") == "false") {
                searchIdeas($("#load-another-content").attr("index"), "");
            }
            else{
                getUser("", mail);
                searchIdeas($("#load-another-content").attr("index"), user_id);
            }
        }
    });



    /*
    Get ID of clicked item. Get information about item
     */

    var layerBg = $("#layer-bg");
    var layerWrapper = $("#layer-wrapper");
    var layerWrapperNewIdea = $("#layer-wrapper-new-idea");
    var ideasSubject = $("#ideas-subject-layer");
    var ideasDescription = $("#ideas-description-layer>textarea");
    var ideasDate = $("#date-layer");
    var ideasLike = $("#like-layer");
    var ideasAuthor = $("#author-layer");
    var likeIcon = $("#like-icon-layer");
    var editIcon = $("#edit-icon-layer");
    var removeIcon = $("#remove-icon-layer");
    var commentsList = $("#ideas-comments-layer");
    var addNewIdea = $("#add-new-idea-button");
    var index;
    var showMapIdea = $("#idea-show-map");
    var coordGet = "";

    function getIdea(index){
        getUser("", mail);
        var dataGetIdea = "id=" + index;

        var getIdea = $.ajax({
            type: "GET",
            url: "api/ideas.php",
            async: false,
            data: dataGetIdea,
            dataType: 'json',
            status: 200,
            statusText: "OK",
            cache: false
        });

        getIdea.done(function(datas){
            var idea = datas['0'][0];
            ideasSubject.text(idea['subject']);
            ideasDescription.val(idea['description'].replace(/\(AND\)/g,"&"));
            ideasDate.text("від " + idea['date']);
            ideasLike.text("Підтримало  " + idea['rating'] + " людей");
            coordGet = idea['coord'];


            var dataGetAuthor = "user_id=" + idea['author'];

            var getAuthor = $.ajax({
                type: "GET",
                url: "api/users.php",
                data: dataGetAuthor,
                async: false,
                dataType: 'json',
                status: 200,
                statusText: "OK",
                cache: false
            });

            getAuthor.done(function(datas){
                var user = datas['0'];
                ideasAuthor.text("Автор: " + user['name']);
                ideasAuthor.attr("index", user['id']);
                ideasAuthor.attr("mail", user['email']);

                var likedIdeas = liked_ideas.split(',');
                var createdIdeas = created_ideas.split(',');

                if(likedIdeas.indexOf(String(index)) >= 0){
                    likeIcon.css("opacity", "1");
                }
                else{
                    likeIcon.css("opacity", "0.3");
                }
                if(user['id'] == user_id){
                    editIcon.css("display", "block");
                    removeIcon.css("display", "block");
                }
                else{
                    editIcon.css("display", "none");
                    removeIcon.css("display", "none");
                }

                if(coordGet.trim() == ""){
                    showMapIdea.css("display", "none");
                }
                else{
                    showMapIdea.css("display", "block");
                }

                var dataGetComments = "id=" + index + "&active=1"

                var getComments = $.ajax({
                    type: "GET",
                    url: "api/comments.php",
                    data: dataGetComments,
                    dataType: 'json',
                    async: false,
                    status: 200,
                    statusText: "OK",
                    cache: false
                });

                getComments.done(function(datas){
                    commentsList.empty();
                    var comments = datas['0'];
                    for(var i = 0; i < comments.length; i++) {
                        var dataGetAuthor = "user_id=" + comments[i]['author'];

                        var getAuthor = $.ajax({
                            type: "GET",
                            url: "api/users.php",
                            async: false,
                            data: dataGetAuthor,
                            dataType: 'json',
                            status: 200,
                            statusText: "OK",
                            cache: false
                        });

                        getAuthor.done(function(usersData){
                            var author = usersData['0'];
                            commentsList.append(
                                '<li>' +
                                '<span class="ideas-comments-author" index="' + author['id'] + "\" mail=\"" + author['email'] + "\">" + author['name'] + "</span>" +
                                '<span class="ideas-comments-date" style="float: right; margin-right: 20px">додано ' + comments[i]['datetime'] +"</span>" +
                                '<div class="ideas-comments-text">' + comments[i]['text'] + "</div>" +
                                '</li>');
                        });
                    }
                });

            });

        });
    }

    showMapIdea.click(function(){
        $("#map-idea").css("height", "400px");
        initialize(coordGet, 15, 'map-canvas-idea');
        var myLatlng = new google.maps.LatLng(parseFloat(coordGet.split(',')[0]), parseFloat(coordGet.split(',')[1]));
        marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            animation: google.maps.Animation.DROP});
        marker.setMap(map);
    });

    function getLastComment(ideaIndex){
        var dataGetComments = "id=" + ideaIndex + "&active=1" + "&last=1";

        var getComments = $.ajax({
            type: "GET",
            url: "api/comments.php",
            data: dataGetComments,
            dataType: 'json',
            async: false,
            status: 200,
            statusText: "OK",
            cache: false
        });

        getComments.done(function(datas){
            var comments = datas['0'];
            for(var i = 0; i < comments.length; i++) {
                var dataGetAuthor = "user_id=" + comments[i]['author'];

                var getAuthor = $.ajax({
                    type: "GET",
                    url: "api/users.php",
                    async: false,
                    data: dataGetAuthor,
                    dataType: 'json',
                    status: 200,
                    statusText: "OK",
                    cache: false
                });

                getAuthor.done(function(usersData){
                    var author = usersData['0'];
                    commentsList.append(
                        '<li>' +
                        '<span class="ideas-comments-author" index="' + author['id'] + "\" mail=\"" + author['email'] + "\">" + author['name'] + "</span>" +
                        '<span class="ideas-comments-date" style="float: right; margin-right: 20px">додано ' + comments[i]['datetime'] +"</span>" +
                        '<div class="ideas-comments-text">' + comments[i]['text'] + "</div>" +
                        '</li>');
                });
            }
        });
    }

    $(document).on("click","#list-ideas-content li", function () {
        index = $(this).attr('index');
        layerBg.css("display", "block");
        layerWrapper.css("display", "block");
        profilePopup.css("display", "none");

        getIdea(index);

        var description = ideasDescription.val(),
            matches = description.match(/\n/g),
            breaks = matches ? matches.length : 2;


        ideasDescription.attr('rows',breaks + 3);

    });


    /*
    Close layer window
     */

    function closeLayerWindow(){
        layerBg.css("display", "none");
        layerWrapper.css("display", "none");
        layerWrapperNewIdea.css("display", "none");
        $("#map").css("height", "0px");
        $("#map-idea").css("height", "0px");

    }

    $(".close-layer").click(function(){
        closeLayerWindow();
    });

    layerBg.click(function(){
        closeLayerWindow();
    });

    /*
    Add new comment
     */

    var commentsArea = $("#editable-comments-area>textarea");
    var addComment = $("#add-comments");
    var cancelComment = $("#cancel-comments");

    commentsArea.click(function(){
        if(commentsArea.val() == "Коментувати...") {
            commentsArea.val("");
            commentsArea.css("min-height", "50px");
            commentsArea.css("color", "black");
        }
    });


    cancelComment.click(function(){
        commentsArea.css("min-height", "30px");
        commentsArea.css("color", "grey");
        commentsArea.val("Коментувати...");
    });

    commentsList.click(function(){
        commentsArea.css("min-height", "30px");
        commentsArea.css("color", "grey");
        commentsArea.val("Коментувати...");
    });


    addComment.click(function(){
        if(commentsArea.val() != "Коментувати..." && commentsArea.val().trim() != "") {
            getUser("", mail);
            if (is_confirmed && !is_banned) {
                var postCommentData = "user_id=" + user_id + "&text=" + commentsArea.val().replace(/(?:\r\n|\r|\n)/g, '<br />') + "&id=" + index;

                var postNewComment = $.ajax({
                    type: "POST",
                    url: "api/comments.php",
                    data: postCommentData,
                    dataType: 'json',
                    status: 200,
                    statusText: "OK",
                    cache: false
                });

                postNewComment.done(function (datas) {
                    var isAddedComment = datas['is_added'];
                    if (isAddedComment == "true") {
                        getLastComment(index);
                        commentsArea.css("min-height", "30px");
                        commentsArea.css("color", "grey");
                        commentsArea.val("Коментувати...");
                    }
                });
            }
            else {
                if(!is_confirmed){
                    showPopUp("Будь ласка, пітвердіть Ваш аккаунт", $(this));
                    dismissPopUp();
                }
                else if(is_banned){
                    showPopUp("Користувач є заблований через порушення правил даного ресурсу.", $(this));
                    dismissPopUp();
                }
            }
        }
    });

    function showPopUp(text, el){
        $("#popup").css("display", "block");
        $("#popup").fadeIn(300);
        $("#popup").text(text);
        var pos = el.offset();
        $('#popup').offset({ top: pos.top + el.height() + 5, left: pos.left });
    }

    function dismissPopUp(){
        setTimeout(function(){
            $("#popup").fadeOut(300);
        }, 2000);
    }


    /*
    Add like
     */

    likeIcon.click(function(){
        getUser(user_id, "");
        var likedIdeas = liked_ideas.split(',');
        var likeIndex = likedIdeas.indexOf(String(index));

        // Reduce
        if(likeIndex >= 0){
            likedIdeas.splice(likeIndex, 1);

            var putLikedIdeas = $.ajax({
                type: "PUT",
                url: "api/users.php",
                data: "id=" + user_id + "&liked_ideas=" + String(likedIdeas),
                dataType: 'json',
                async: false,
                status: 200,
                statusText: "OK",
                cache: false
            });

            putLikedIdeas.done(function(datas) {
                var isUpdated = datas['is_updated'];
                if(isUpdated == "true"){

                    var getRatingIdea = $.ajax({
                        type: "GET",
                        url: "api/ideas.php",
                        data: "id=" + index,
                        dataType: 'json',
                        async: false,
                        status: 200,
                        statusText: "OK",
                        cache: false
                    });

                    getRatingIdea.done(function(datas) {
                        var rating = datas['0'][0]['rating'];
                        var newRating = String(parseInt(rating) - 1);

                        var putLikedIdeas = $.ajax({
                            type: "PUT",
                            url: "api/ideas.php",
                            data: "id=" + index + "&rating_val=" + newRating,
                            dataType: 'json',
                            async: false,
                            status: 200,
                            statusText: "OK",
                            cache: false
                        });

                        putLikedIdeas.done(function(datas) {
                            var isUpdated = datas['is_updated'];
                            if (isUpdated == "true"){
                                likeIcon.css("opacity", "0.3");
                                ideasLike.text("Підтримало  " + newRating + " людей");
                                $("li[index='" + index + "'] .info-ideas-item-like").html(newRating);
                            }
                        });

                    });
                }

            });
        }

        //Increase
        else{
            likedIdeas.push(index);
            var newArrayLikedIdeas = likedIdeas.join();
            var putLikedIdeas = $.ajax({
                type: "PUT",
                url: "api/users.php",
                data: "id=" + user_id + "&liked_ideas=" + newArrayLikedIdeas,
                dataType: 'json',
                status: 200,
                statusText: "OK",
                cache: false
            });

            putLikedIdeas.done(function(datas) {
                var isUpdated = datas['is_updated'];
                if(isUpdated == "true"){

                    var getRatingIdea = $.ajax({
                        type: "GET",
                        url: "api/ideas.php",
                        data: "id=" + index,
                        dataType: 'json',
                        async: false,
                        status: 200,
                        statusText: "OK",
                        cache: false
                    });

                    getRatingIdea.done(function(datas) {
                        var rating = datas['0'][0]['rating'];
                        var newRating = String(parseInt(rating) + 1);

                        var putLikedIdeas = $.ajax({
                            type: "PUT",
                            url: "api/ideas.php",
                            data: "id=" + index + "&rating_val=" + newRating,
                            dataType: 'json',
                            async: false,
                            status: 200,
                            statusText: "OK",
                            cache: false
                        });

                        putLikedIdeas.done(function(datas) {
                            var isUpdated = datas['is_updated'];
                            if (isUpdated == "true"){
                                likeIcon.css("opacity", "1");
                                ideasLike.text("Підтримало  " + newRating + " людей");
                                $("li[index='" + index + "'] .info-ideas-item-like").text(newRating);
                            }
                        });

                    });
                }

            });
        }
    });

    /*
    Add new idea
     */

    addNewIdea.click(function(){
        profilePopup.css("display", "none");
        getUser("", mail);
        if (is_confirmed && !is_banned) {
            layerBg.css("display", "block");
            layerWrapperNewIdea.css("display", "block");
        }
        else{
            if(!is_confirmed){
                showPopUp("Будь ласка, пітвердіть Ваш аккаунт", $(this));
                dismissPopUp();
            }
            else if(is_banned){
                showPopUp("Користувач є заблований через порушення правил даного ресурсу.", $(this));
                dismissPopUp();
            }
        }

    });

    var newIdeaSubject = $("#editable-subject-area>input");
    var newIdeaBody = $("#editable-body-area>textarea");
    var newIdeaRegion = $("#new-idea-region-select");
    var newIdeaCity = $("#new-idea-search-city");
    var newIdeaCategory = $("#new-idea-category-select");
    var newIdeaAddButton = $("#add-new-idea");
    var newIdeaCancel = $("#cancel-new-idea");
    var newIdeaCoordinate = $("#new-idea-show-map");

    var coord = "";

    newIdeaSubject.click(function(){
        if(newIdeaSubject.val() == "Назва ідеї...") {
            newIdeaSubject.val("");
            newIdeaSubject.css("color", "black");
        }
    });

    newIdeaBody.click(function(){
        if(newIdeaBody.val() == "Введіть опис ідеї...") {
            newIdeaBody.val("");
            newIdeaBody.css("min-height", "100px");
            newIdeaBody.css("color", "black");
        }
    });

    newIdeaCoordinate.click(function(){
        $("#map").css("height", "400px");
        initialize("49.508577, 31.336679", 6, 'map-canvas');
        function clearOverlays() {
            for (var i = 0; i < markersArray.length; i++ ) {
                markersArray[i].setMap(null);
            }
        }

        google.maps.event.addListener(map, 'click', function(event) {
            clearOverlays();
            marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                draggable:true,
                animation: google.maps.Animation.DROP});
            markersArray.push(marker);
            marker.setMap(map);
            coord = String(event.latLng).replace("(","").replace(")","");
        });
    });

    newIdeaCancel.click(function(){;
        newIdeaSubject.val("Назва ідеї...");
        newIdeaBody.val("Введіть опис ідеї...");
        newIdeaUploadFile.val("Завантажити фото");
        newIdeaBody.css("min-height", "90px");
        newIdeaBody.css("color", "grey");
        newIdeaSubject.css("color", "grey");
        $("#map").css("height", "0px");
    });

    newIdeaAddButton.click(function(){
        var regionId = newIdeaRegion.find(":selected").index();
        var categoryId = newIdeaCategory.find(":selected").index();
        var cityName = newIdeaCity.val();
        var dataGetCityId = "region_id=" + regionId + "&city_name=" + cityName;

        if (is_confirmed && !is_banned) {
            if (newIdeaSubject.val().trim() == "" || newIdeaSubject.val().trim() == "Назва ідеї..." || newIdeaBody.val().trim() == "" || newIdeaBody.val().trim() == "Введіть опис ідеї...") {
                showPopUp("Введіть назву та опис ідеї.", $(this));
                dismissPopUp();
            }
            else{
                if(newIdeaSubject.val().trim().length < 20 || newIdeaBody.val().trim().length < 50){
                    showPopUp("Назва ідеї або опис є надто короткими", $(this));
                    dismissPopUp();
                }
                else {
                    var getCity = $.ajax({
                        type: "GET",
                        url: "api/city.php",
                        data: dataGetCityId,
                        dataType: 'json',
                        status: 200,
                        statusText: "OK",
                        cache: false
                    });

                    getCity.done(function (datas) {
                        var cityId = datas['city_id'];
                        if (cityId == null) {
                            cityId = 0;
                        }

                        var newIdeaUploadFile = document.getElementById('new-idea-image-upload');

                        if(newIdeaUploadFile.files.length > 5){
                            showPopUp("Ви можете додати не більше 5 зображень", newIdeaAddButton);
                            dismissPopUp();
                        }
                        else {
                            var matchError = ""
                            var match= ["image/jpeg","image/png","image/jpg"];
                            for (var i = 0; i < newIdeaUploadFile.files.length; i++) {
                                var imagefile = newIdeaUploadFile.files[i].type;
                                if ((imagefile != match[0]) && (imagefile != match[1]) && (imagefile != match[2])) {
                                    matchError += "e";
                                }
                            }

                            if (matchError.length > 0){
                                showPopUp("Формат файлів може бути: png, jpeg, jpg", newIdeaAddButton);
                                dismissPopUp();
                            }
                            else {

                                var form = document.getElementById('uploadimage');
                                var formData = new FormData(form);
                                var files = "";

                                for (var j = 0; j < newIdeaUploadFile.files.length; j++) {
                                    var name = "idea_" + Math.round(+new Date()/1000/60/60/24 - 100) + "_" + newIdeaUploadFile.files.item(j).name;
                                    newIdeaUploadFile.files.item(j).name = name;
                                    files += name + " ";
                                }

                                var uploadImages =  $.ajax({
                                    url: "upload_images.php",
                                    type: "POST",
                                    data: formData,
                                    dataType: 'json',
                                    contentType: false,
                                    async: false,
                                    cache: false,
                                    processData: false
                                });

                                uploadImages.done(function(datas){
                                    var uploadedF = datas['uploaded_files'];
                                    if(files.length <= 0){
                                        getUser("", mail);
                                        var dataPostIdea = "region_id=" + regionId + "&city_id=" + cityId + "&coordinates=" + coord + "&user_id=" + user_id + "&category=" + categoryId +
                                            "&subject_text=" + newIdeaSubject.val() + "&description_text=" + newIdeaBody.val().replace(new RegExp("&","g"),"(AND)") + "&files=" + files.trim();

                                        var postIdea = $.ajax({
                                            type: "POST",
                                            url: "api/ideas.php",
                                            data: dataPostIdea,
                                            dataType: 'json',
                                            status: 200,
                                            statusText: "OK",
                                            cache: false
                                        });

                                        postIdea.done(function (datas) {
                                            var isCreated = datas['is_created'];
                                            if (isCreated == "true") {
                                                newIdeaSubject.val("Назва ідеї...");
                                                newIdeaBody.val("Введіть опис ідеї...");
                                                $("new-idea-image-upload").val("Завантажити фото");
                                                newIdeaBody.css("min-height", "60px");
                                                newIdeaBody.css("color", "grey");
                                                newIdeaSubject.css("color", "grey");
                                                $("#done-icon").css("opacity", "1");
                                                setTimeout(function () {
                                                    $("#done-icon").css("opacity", "0");
                                                    closeLayerWindow();

                                                }, 1000);

                                            }

                                        });
                                    }
                                    else{
                                        if(uploadedF == files) {

                                            getUser("", mail);
                                            var dataPostIdea = "region_id=" + regionId + "&city_id=" + cityId + "&coordinates=" + coord + "&user_id=" + user_id + "&category=" + categoryId +
                                                "&subject_text=" + newIdeaSubject.val() + "&description_text=" + newIdeaBody.val().replace(new RegExp("&","g"),"(AND)") + "&files=" + files.trim();

                                            var postIdea = $.ajax({
                                                type: "POST",
                                                url: "api/ideas.php",
                                                data: dataPostIdea,
                                                dataType: 'json',
                                                status: 200,
                                                statusText: "OK",
                                                cache: false
                                            });

                                            postIdea.done(function (datas) {
                                                var isCreated = datas['is_created'];
                                                if (isCreated == "true") {
                                                    newIdeaSubject.val("Назва ідеї...");
                                                    newIdeaBody.val("Введіть опис ідеї...");
                                                    $("new-idea-image-upload").val("Завантажити фото");
                                                    newIdeaBody.css("min-height", "60px");
                                                    newIdeaBody.css("color", "grey");
                                                    newIdeaSubject.css("color", "grey");
                                                    $("#done-icon").css("opacity", "1");
                                                    setTimeout(function () {
                                                        $("#done-icon").css("opacity", "0");
                                                        closeLayerWindow();

                                                    }, 1000);

                                                }

                                            });
                                        }
                                    }

                                });
                            }
                        }

                    });
                }
            }

        }
        else {
            if (!is_confirmed) {
                showPopUp("Будь ласка, пітвердіть Ваш аккаунт", $(this));
                dismissPopUp();
            }
            else if (is_banned) {
                showPopUp("Користувач є заблований через порушення правил даного ресурсу.", $(this));
                dismissPopUp();
            }
        }
    });

    var profilePopup = $("#my-profile");

    $("#profile-link").click(function(){
        if(profilePopup.css("display") == "none") {
            profilePopup.css("display", "block");
            profilePopup.fadeIn(300);
            var pos = $(this).offset();
            profilePopup.offset({top: pos.top + $(this).height() + 10, left: pos.left});
        }

        else{
            profilePopup.css("display", "none");
        }
    });

    $("#my-ideas").click(function(){
        limitIndex.attr("singleuser", "true");
        content.empty();
        limitIndex.attr("index", "0");
        getUser("", mail);
        searchIdeas(0, user_id, "user_id=" + user_id + "&sort_by=0&limit=" + limitIndex.attr("index") + "," + limitCount);
        setTimeout(function(){
            profilePopup.css("display", "none");
        },200);
    });

    editIcon.click(function(){
        ideasDescription.removeAttr("readonly");
        ideasDescription.focus();
        ideasDescription.css("background-color","#FDFDFD");
        ideasDescription.css("border","1px solid lightgray");
    });

    function replaceStyleAttr (str) {
        return str.replace(/(<[\w\W]*?)(style)([\w\W]*?>)/g, function (a, b, c, d) {
            return b + 'style_replace' + d;
        });
    }

    function removeTagsExcludeA (str) {
        return str.replace(/<\/?((?!a)(\w+))\s*[\w\W]*?>/g, '');
    }

    function removeAllTags (str) {
        return str.replace(/<\/?(\w+)\s*[\w\W]*?>/g, '');
    }


    ideasDescription.focusout(function(){
        getUser("", mail);

        var dataGetIdeasByAuthrId = "user_id=" + user_id;

        var getIdeas = $.ajax({
            type: "GET",
            url: "api/ideas.php",
            data: dataGetIdeasByAuthrId,
            dataType: 'json',
            async: false,
            status: 200,
            statusText: "OK",
            cache: false
        });

        getIdeas.done(function (datas) {
            var ideas = datas['0'];
            var isCreated = false;
            for (var i = 0; i < ideas.length; i++) {
                if (ideas[i]['author'] == user_id) {
                    isCreated = true;
                }
            }

            if (isCreated == true) {
                if(ideasDescription.attr("readonly") != "readonly"){
                //TODO
                var description = ideasDescription.val().replace(new RegExp("&","g"),"(AND)");

                //.replace(new RegExp("&lt;", "g"),"<")
                //.replace(new RegExp("&gt;", "g"),">")
                //.replace(/(<[^>]*>)/g, "<br>")
                //.replace(/&lt*;.*&gt*;/g, "");
                //.replace(new RegExp("<br><br>", "g"),"<br>");

                if (description.trim() == "") {
                    showPopUp("Додайте опис", ideasDescription);
                    dismissPopUp();
                }
                else {
                    if (description.length < 50) {
                        showPopUp("Опис повинен містити хоча б 50 символів", ideasDescription);
                        dismissPopUp();
                    }
                    else {
                        var putUpdatedIdeas = $.ajax({
                            type: "PUT",
                            url: "api/ideas.php",
                            data: "id=" + index + "&description_text=" + description,
                            dataType: 'json',
                            async: false,
                            status: 200,
                            statusText: "OK",
                            cache: false
                        });

                        putUpdatedIdeas.done(function (datas) {
                            var isUpdated = datas['is_updated'];
                            if (isUpdated == "true") {
                                ideasDescription.css("background-color", "#C6FCD9");
                                setTimeout(function () {
                                    ideasDescription.css("background-color", "#FFFFFF");
                                }, 1000);
                                ideasDescription.attr("readonly", "readonly");
                                ideasDescription.css("border","none");

                                var text = description,
                                    matches = text.match(/\n/g),
                                    breaks = matches ? matches.length : 2;

                                ideasDescription.attr('rows',breaks + 2);
                            }
                        });
                    }
                }
            }
        }
        });
    });

    removeIcon.click(function(){
        getUser("", mail);
        var dataGetIdeasByAuthrId = "user_id=" + user_id;

        var getIdeas = $.ajax({
            type: "GET",
            url: "api/ideas.php",
            data: dataGetIdeasByAuthrId,
            dataType: 'json',
            async: false,
            status: 200,
            statusText: "OK",
            cache: false
        });

        getIdeas.done(function (datas) {
            var ideas = datas['0'];
            var isCreated = false;
            for (var i = 0; i < ideas.length; i++) {
                if (ideas[i]['author'] == user_id) {
                    isCreated = true;
                }
            }

            if (isCreated == true) {

                $( "#dialog" ).dialog({
                    dialogClass: "no-close",
                    buttons: [
                        {
                            text: "OK",
                            click: function() {
                                var putUpdatedIdeas = $.ajax({
                                    type: "PUT",
                                    url: "api/ideas.php",
                                    data: "id=" + index + "&delete=1",
                                    dataType: 'json',
                                    async: false,
                                    status: 200,
                                    statusText: "OK",
                                    cache: false
                                });

                                putUpdatedIdeas.done(function (datas) {
                                    var isUpdated = datas['is_updated'];
                                    if (isUpdated == "true") {
                                        closeLayerWindow();
                                        $("li[index='" + index + "']").remove();
                                    }
                                });
                                $( this ).dialog( "close" );
                            }
                        }
                    ]
                });
            }
        });
    });
});