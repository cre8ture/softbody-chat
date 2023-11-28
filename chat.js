document.addEventListener('DOMContentLoaded', function() {

    let softbody1_input = document.getElementById("inputBox1");
    let softbody2_input = document.getElementById("inputBox2");
    let chat_messages = document.getElementById("chat-messages");
    console.log(chat_messages)
    
    softbody1_input.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) { // Use 13 for Enter key
            event.preventDefault();
            const softbody1_input_value = softbody1_input.value;
            console.log(softbody1_input_value);
            const new_message = document.createElement("li");
            new_message.textContent = "Iga: " + softbody1_input_value;

            chat_messages.appendChild(new_message);
            softbody1_input.value = ""; // Clear the input field
        }
    })

    softbody2_input.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) { // Use 13 for Enter key
            event.preventDefault();
            const softbody2_input_value = softbody2_input.value;
            const new_message = document.createElement("li");
            new_message.textContent = "Bello: " + softbody2_input_value;
            chat_messages.appendChild(new_message);
            softbody2_input.value = ""; // Clear the input field
        }
    })
})