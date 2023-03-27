const descriptions = document.getElementsByClassName("description")
for(let description of descriptions){
    if (description.textContent.length > 100){
        description.textContent = description.textContent.substring(0,100)
        description.textContent += "..."
    }
}

