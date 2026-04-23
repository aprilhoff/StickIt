// infinite canvas on mouse scroll
const canvas = document.querySelector(".canvas");
let x = 0, y = 0;
const CANVAS_W = 5000; 
const CANVAS_H = 5000;

// options for background of notes
const noteImage = {
    blue: 'assets/Blue.png',
    green: 'assets/Green.png',
    orange: 'assets/Orange.png',
    pink: 'assets/Pink.png',
    yellow: 'assets/Yellow.png',
    red: 'assets/Red.png',
    purple: 'assets/Purple.png'
}

// making the notes draggable
function makeDraggable(el) {
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    el.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origLeft = parseInt(el.style.left);
        origTop = parseInt(el.style.top);

        el.style.zIndex = 10;
        el.style.cursor = 'grabbing';
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const scale = new DOMMatrix(canvas.style.transform).a || 1;

        const dx = (e.clientX - startX) / scale;
        const dy = (e.clientY - startY) / scale;

        el.style.left = (origLeft + dx) + 'px';
        el.style.top  = (origTop  + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        el.style.zIndex = '';
        el.style.cursor = '';
    });
}

document.addEventListener("wheel", e => {
    e.preventDefault();

    x -= e.deltaX;
    y -= e.deltaY;

    console.log(x, y, -(CANVAS_W - window.innerWidth), -(CANVAS_H - window.innerHeight));

    x = Math.min(0, Math.max(-(CANVAS_W - window.innerWidth), x));
    y = Math.min(0, Math.max(-(CANVAS_H - window.innerHeight), y));

    canvas.style.transform = `translate(${x}px, ${y}px)`;
}, { passive: false });


// adding JSON Bin API info here
const BIN_ID = '69cdb661aaba882197b7c104';
const API_KEY = '$2a$10$x6hw1La6NxezJ1lJrjj11e.QEXjhpWFcu/wGk78FaaAJTLsNoGT2e';
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`; //leave as is

// getting note and date from json bin
async function getNotes(){
    const res = await fetch(URL + '/latest', {
   headers: { 'X-Master-Key': API_KEY }
 });
 const data = await res.json();
 return data.record.notes;
}

// adding note to json bin
async function addNote (newNote) {
    const notes = await getNotes();
    notes.push(newNote);
    await fetch(URL, {
   method: 'PUT',
   headers: {
     'Content-Type': 'application/json',
     'X-Master-Key': API_KEY
   },
   body: JSON.stringify({ notes: notes })
 });
}

// options for the color of notes
const colors = Object.keys(noteImage);

// connect to the submit button
document.getElementById('submitBtn').addEventListener('click', async () => {
    const message = document.getElementById('message').value;
    const date = document.getElementById('date').value;

    const messageValue = message.trim();
    const dateValue = date.trim();

    if (messageValue && dateValue) {
        document.getElementById('submitBtn').innerText ='Loading...';
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)]; 
        await addNote({ message: messageValue, date: dateValue, color: randomColor });

        document.getElementById('message').value = '';
        document.getElementById('date').value = '';
        document.getElementById('submitBtn').innerText ='Log';
        refresh();
        
    }
});


async function refresh() {
   
    const notes = await getNotes();
    document.getElementById('content').innerHTML = notes.map((note, i) => {

        const seed = i * 137.508;
        const x = (Math.sin(seed) * 0.5 + 0.5) * 3000 + 200;
        const y = (Math.cos(seed * 1.3) * 0.5 + 0.5) * 2000 + 200;
        
        return `
            <div id="note-${i}" class="note" style="
                background-image: url(${noteImage[note.color]});
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                cursor: grab;
            ">
                <p class="date">${note.date}</p>
                <p class="message">${note.message}</p>
            </div>
        `;
    }).join('');
    //pan to lastNoteX and lastNoteY
   // window.scrollTo(lastNoteX, lastNoteY)
    
    document.querySelectorAll('.note').forEach(makeDraggable);
    let lastNote = document.getElementById(`note-${(await getNotes()).length - 1}`);
        window.scrollTo(parseInt(lastNote.style.left) - window.innerWidth/2 + 200, parseInt(lastNote.style.top) - 200 );

}
refresh();
//setInterval(refresh, 10000);

// about button activate

let aboutBtn = document.getElementById('about');
aboutBtn.addEventListener('click', () => {
    const displayArea = document.getElementById("aboutText");
    const isVisible = displayArea.innerText.length > 0;
    displayArea.innerHTML = isVisible ? '' : 'Stick It invites users to paste their personal notes from the Notes app. Aiming to reflect on the human impulse to record thoughts while also exposing how quickly that meaning can dissolve when context is lost or removed. Notes should remain anonymous.<br><br>Typeface used is SF Pro Rounded by Apple.<br><br>Made by <a href="https://aprilhoffmeister.xyz" target="_blank">April Hoffmeister, 2026.</a>';

    const plusSign = aboutBtn.querySelector('h2:nth-child(2)');
    plusSign.innerText = isVisible ? '+' : '-';
});
