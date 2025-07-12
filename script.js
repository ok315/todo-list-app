function LoadTasksFromLocalStorage(tasks = null) {
    tasks = tasks || JSON.parse(localStorage.getItem("tasks")) || [];
    tasklist.innerHTML = ""; // Clear list before re-rendering

    tasks.forEach(function(taskobj){
        let listitem = document.createElement("li");

        const tasktext = document.createElement("span");
        tasktext.textContent = taskobj.text;

        if (taskobj.completed){
            tasktext.classList.add("Completed");
        }
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = taskobj.completed;

        checkbox.addEventListener("change", function(){
            tasktext.classList.toggle("Completed");
            taskobj.completed = checkbox.checked;
            localStorage.setItem("tasks", JSON.stringify(tasks));
            console.log("Updated task:", taskobj);
        });

        const delbtn = document.createElement("button");    
        delbtn.textContent = "Delete";
        delbtn.style.marginLeft = "10px";
        delbtn.addEventListener("click", function(){
            listitem.remove();  
            tasks = tasks.filter(t => t.id !== taskobj.id);
            localStorage.setItem("tasks", JSON.stringify(tasks));                           
        });

        const editbtn = document.createElement("button");
        editbtn.textContent = "Edit";
        editbtn.style.marginLeft = "10px";
        editbtn.addEventListener("click", function(){
            let new_text = prompt("Edit your task: ", taskobj.text);
            if (new_text !== null && new_text !== ""){
                taskobj.text = new_text.trim();
                tasktext.textContent = new_text.trim();
            } else if (new_text === "" || new_text === null){
                alert("Task text cannot be empty.");
                return;
            }
            localStorage.setItem("tasks", JSON.stringify(tasks));
        })

        listitem.appendChild(checkbox);
        listitem.appendChild(tasktext);
        listitem.appendChild(delbtn);
        listitem.appendChild(editbtn);

        tasklist.appendChild(listitem);
    });
}

let btn = document.querySelector("#addbtn");
let text = document.querySelector("#inptext");
let tasklist = document.querySelector("#tasklist");
let clearallbtn = document.querySelector("#clearallbtn");
let searchinput = document.querySelector("#searchInput");
let filterDropdown = document.querySelector("#filterTasks");
let sortDropdown = document.querySelector("#sortTasks");


btn.addEventListener("click", function(){
    let task = text.value;
    if (task.trim() === ""){
        alert("Task text cannot be empty.");
        return;
    }else if (task != "") {
        let now = new Date();
        let new_task = {
        id: Date.now(),
        text: task,
        completed: false,
        time: now.toLocaleString(),       // For display
        timestamp: now.getTime()          // For sorting
        };
    
        
        let tasks = localStorage.getItem("tasks");
        tasks = tasks ? JSON.parse(tasks) : [];
        tasks.push(new_task);
        localStorage.setItem("tasks", JSON.stringify(tasks));

        const listitem = document.createElement("li");

        const tasktext = document.createElement("span");
        tasktext.textContent = new_task.text;
        

        const delbtn = document.createElement("button");      //creating delete button for every task
        delbtn.textContent = "Delete";
        delbtn.style.marginLeft = "10px";
        delbtn.addEventListener("click", function(){
            listitem.remove();                              //to remove task
            let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            tasks = tasks.filter(t => t.id !== new_task.id);
            localStorage.setItem("tasks", JSON.stringify(tasks));
        });

        const editbtn = document.createElement("button");
        editbtn.textContent = "Edit";
        editbtn.style.marginLeft = "10px";  
        editbtn.addEventListener("click", function(){
            let newText = prompt("Edit your task:", new_task.text);
            if (newText !== null && newText.trim() !== "") {
                new_task.text = newText.trim();                         // update task object
                tasktext.textContent = newText.trim();  

                let update_tasks = JSON.parse(localStorage.getItem("tasks"));
                update_tasks = update_tasks.map(t => {
                    if (t.id === new_task.id){
                        t.text = new_task.text;
                    }
                    return t;
                });
                localStorage.setItem("tasks", JSON.stringify(update_tasks));
            } else if (newText === "" || newText === null) {
                alert("Task text cannot be empty.");
                return;
            }
        });


        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = new_task.completed;

        checkbox.addEventListener("change", function(){
            tasktext.classList.toggle("Completed");
            new_task.completed = checkbox.checked;

            let update_tasks = JSON.parse(localStorage.getItem("tasks"));
            update_tasks = update_tasks.map(t => {
                if (t.id === new_task.id){
                    t.completed = new_task.completed;
                }
                return t;
            })
        localStorage.setItem("tasks", JSON.stringify(update_tasks));
        });
        
        listitem.appendChild(checkbox);
        listitem.appendChild(tasktext);
        listitem.appendChild(delbtn);                       //delete button is added in the listitem which is the task
        listitem.appendChild(editbtn);

        tasklist.appendChild(listitem);                     //Each task is added in the task list
        console.log("Task has been added to list")
        text.value = "";
        const currentSort = sortDropdown.value;
        if (currentSort === "newest" || currentSort === "oldest") {
            sortDropdown.dispatchEvent(new Event("change"));  // Triggers sorting again
        } else {
            LoadTasksFromLocalStorage(); // fallback if no sort selected
        }
        const currentFilter = filterDropdown.value;
        if (currentFilter !== "all") {
            filterDropdown.dispatchEvent(new Event("change"));
        }

        // 🟡 Reapply current search
        const currentSearch = searchinput.value.trim().toLowerCase();
        if (currentSearch !== "") {
            searchinput.dispatchEvent(new Event("input"));
        }
    }
});
LoadTasksFromLocalStorage();



sortDropdown.addEventListener("change", function () {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (this.value === "newest") {
        tasks.sort((a, b) => b.timestamp - a.timestamp); // Newest first
    } else if (this.value === "oldest") {
        tasks.sort((a, b) => a.timestamp - b.timestamp); // Oldest first
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    tasklist.innerHTML = "";            
    LoadTasksFromLocalStorage(tasks);   // Reload sorted tasks

    filterDropdown.dispatchEvent(new Event("change"));
});


filterDropdown.addEventListener("change", function () {
    const value = this.value;
    const allTasks = document.querySelectorAll("#tasklist li");

    allTasks.forEach(item => {
        const isCompleted = item.querySelector("input[type='checkbox']").checked;

        if (value === "all") {
            item.style.display = "";
        } else if (value === "completed") {
            item.style.display = isCompleted ? "" : "none";
        } else if (value === "uncompleted") {
            item.style.display = !isCompleted ? "" : "none";
        }
    });
});


searchinput.addEventListener("input", function(){
    const query = searchinput.value.toLowerCase();
    const alltasks = document.querySelectorAll("#tasklist li");
    const noTasksMessage = document.querySelector("#noTasksMessage");
    let found = false;
    alltasks.forEach(item => {
        const tasktext = item.querySelector("span").textContent.toLowerCase();
        if (tasktext.includes(query)) {
            // Match found — now check filter condition too
            const isCompleted = item.querySelector("input[type='checkbox']").checked;

            if (
                filterDropdown.value === "all" ||
                (filterDropdown.value === "completed" && isCompleted) ||
                (filterDropdown.value === "uncompleted" && !isCompleted)
            ) {
                item.style.display = "";
                found = true;
            } else {
                item.style.display = "none";
                    }
        } else {
            item.style.display = "none";
        }

    });
    noTasksMessage.style.display = found ? "none" : "block";
});

clearallbtn.addEventListener("click", function(){
    localStorage.removeItem("tasks");
    tasklist.innerHTML = "";
    console.log("All tasks are cleared!");
});