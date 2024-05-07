function toggle(selectedPage, userID = null) {
    const contents = document.querySelectorAll('.tabcontent');
    contents.forEach(content => content.style.display = 'none');
    const links = document.querySelectorAll('.tablink');
    links.forEach(link => link.classList.remove('active'));
    document.getElementById(selectedPage).style.display = 'block';
    event.currentTarget.classList.add('active');

    if(selectedPage === 'MyBoards'){
        updateMyBoards(userID);
    }

}
document.querySelector('#defaultOpen').click();


function addCollaborator() {
    let username = document.getElementById('collaborator').value;
    
    let addUserRequest = new XMLHttpRequest();
    addUserRequest.open("POST", '/addArtistToBoard', true)
    addUserRequest.setRequestHeader('Content-Type', 'application/json');

    let requestBody = {
        "username" : username
    }
    requestBody = JSON.stringify(requestBody);

    addUserRequest.send(requestBody);

    addUserRequest.onload = function(){
        let response = JSON.parse(this.responseText);

        if(response["userExists"] === true){
            let list = document.getElementById('collaboratorsList');
            
            let newRow = document.createElement('tr');
            let newUsername = document.createElement('td');
            newUsername.innerText = username;
            let newName = document.createElement('td');
            newName.innerText = response["name"];
            
            newRow.appendChild(newUsername);
            newRow.appendChild(newName);
            list.appendChild(newRow);
        }
        else{
            alert("Couldn't find that person. Double check the username!")
        }


    }

}

function createBoard(ownerID) {

    let createBoardRequest = new XMLHttpRequest();
    createBoardRequest.open("POST", '/createBoard', true);
    createBoardRequest.setRequestHeader('Content-Type', 'application/json');

    let requestBody = {
        "ownerID" : Number(ownerID),
        "name" : "",
        "artistUsernames" : {}
    };
    
    let boardName = document.getElementById('boardName').value;
    if(boardName == ""){
        alert("Give your board a name first!");
        return;
    }
    requestBody["name"] = boardName;

    let collaboratorTable = document.getElementById('collaboratorsList');
    for (var i = 1, row; row = collaboratorTable.rows[i]; i++) {
        requestBody["artistUsernames"][i] = row.cells[0].innerText;
    }

    console.log(requestBody);

    requestBody = JSON.stringify(requestBody);

    createBoardRequest.send(requestBody);

    createBoardRequest.onload = function(){
        let response = JSON.parse(this.responseText);

        let boardURL = "/board/" + response["userID"] + '/' + response["boardID"];

        window.location.assign(boardURL);
    }

}

function updateMyBoards(userID) {
    let boardList = document.getElementById("list2");
    while (boardList.firstChild) {
        boardList.removeChild(boardList.firstChild);
    }

    let headerRow = document.createElement("tr");
    headerRow.id = "board-header";
    let boardsHeader = document.createElement("th");
    boardsHeader.innerText = "Boards";
    headerRow.appendChild(boardsHeader);
    let collaboratorsHeader = document.createElement("th");
    collaboratorsHeader.innerText = "Collaborators";
    headerRow.appendChild(collaboratorsHeader);
    let previewHeader = document.createElement("th");
    previewHeader.innerText = "Preview";
    headerRow.appendChild(previewHeader);
    let actionsHeader = document.createElement("th");
    actionsHeader.innerText = "Actions";
    headerRow.appendChild(actionsHeader);

    boardList.appendChild(headerRow);
    
    let myBoardsRequest = new XMLHttpRequest();
    myBoardsRequest.open("GET", "/myBoards/" + userID, true);
    myBoardsRequest.send();

    myBoardsRequest.onload = function(){
        let response = JSON.parse(this.responseText);
        for(let key in response){
            let board = response[key];

            let boardRow = document.createElement("tr");
            boardRow.classList.add("board-item");
            boardList.appendChild(boardRow);
        
            let boardNameCell = document.createElement("td");
            boardNameCell.innerText = board["name"];
            boardRow.appendChild(boardNameCell);

            let collaboratorList = "";
            for(let collabKey in board["collaborators"]){
                let collaborator = board["collaborators"][collabKey];
                if(collaboratorList.length <= 60){
                    collaboratorList += collaborator + ", ";
                }
                else{
                    collaboratorList += "...";
                    break;
                }
            }
            let boardCollaboratorCell = document.createElement("td");
            boardCollaboratorCell.innerText = collaboratorList;
            boardRow.appendChild(boardCollaboratorCell);

            let boardPreviewCell = document.createElement("td");
            let boardPreview = document.createElement("img");
            boardPreview.classList.add("boardPreview")
            boardPreview.src = board["boardData"];
            boardPreviewCell.appendChild(boardPreview);
            boardRow.appendChild(boardPreviewCell);

            let boardActionsCell = document.createElement("td");
            boardRow.appendChild(boardActionsCell);

            let boardOpenButton = document.createElement("button");
            boardOpenButton.classList.add("board-action-button");
            boardOpenButton.innerText = "Open";

            boardOpenButton.addEventListener("click", function() {
                let boardURL = "/board/" + String(userID) + '/' + String(board["boardID"]);
                window.location.assign(boardURL);
            });

            boardActionsCell.appendChild(boardOpenButton);

            if(board.owned){
                let boardDeleteButton = document.createElement("button");
                boardDeleteButton.classList.add("board-action-button");
                boardDeleteButton.innerText = "Delete!";

                boardDeleteButton.addEventListener("click", function() {
                    deleteBoard(userID, board.boardID);
                });

                boardActionsCell.appendChild(boardDeleteButton);
            }
            else{
                let boardLeaveButton = document.createElement("button");
                boardLeaveButton.classList.add("board-action-button");
                boardLeaveButton.innerText = "Leave!";

                boardLeaveButton.addEventListener("click", function() {
                    leaveBoard(userID, board.boardID);
                });

                boardActionsCell.appendChild(boardLeaveButton);
            }

        }
    }
}

function deleteBoard(userID, boardID){
    console.log("Deleting board with ID " + String(boardID));
    let deleteBoardRequest = new XMLHttpRequest();
    deleteBoardRequest.open("DELETE", "/deleteBoard/" + String(boardID), true);
    deleteBoardRequest.send();

    deleteBoardRequest.onload = function(){
        let response = JSON.parse(this.responseText);
        if(response["refreshList"] === true){
            updateMyBoards(userID);
        }
        else{
            alert("ERROR: Could not delete board. Sorry about that!");
        }
    }
    
}

function leaveBoard(userID, boardID){
    console.log("leaving board with ID " + String(boardID));
    let leaveBoardRequest = new XMLHttpRequest();
    leaveBoardRequest.open("DELETE", "/leaveBoard/" + String(boardID) + "/" + String(userID), true);
    leaveBoardRequest.send();

    leaveBoardRequest.onload = function(){
        let response = JSON.parse(this.responseText);
        if(response["refreshList"] === true){
            updateMyBoards(userID);
        }
        else{
            alert("ERROR: Could not leave board. Sorry about that!");
        }
    }
}