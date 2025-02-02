const rooms = {
    bedroom: {
        items: {
            bed: ['bed1.png', 'bed2.png', 'bed3.png'],
            lamp: ['lamp1.png', 'lamp2.png', 'lamp3.png'],
            table: ['table1.png', 'table2.png', 'table3.png'],
            chair: ['chair1.png', 'chair2.png', 'chair3.png']
        },
        backgrounds: [
            'url("bedroom-bg1.jpg")',
            'url("bedroom-bg2.jpg")',
            'url("bedroom-bg3.jpg")'
        ]
    },
    bathroom: {
        items: {
            sink: ['sink1.png', 'sink2.png', 'sink3.png'],
            toilet: ['toilet1.png', 'toilet2.png', 'toilet3.png'],
            shower: ['shower1.png', 'shower2.png', 'shower3.png'],
            mirror: ['mirror1.png', 'mirror2.png', 'mirror3.png']
        },
        backgrounds: [
            'url("bathroom-bg1.jpg")',
            'url("bathroom-bg2.jpg")',
            'url("bathroom-bg3.jpg")'
        ]
    },
    garden: {
        items: {
            tree: ['tree1.png', 'tree2.png', 'tree3.png'],
            bench: ['bench1.png', 'bench2.png', 'bench3.png'],
            fountain: ['fountain1.png', 'fountain2.png', 'fountain3.png'],
            flowerbed: ['flowerbed1.png', 'flowerbed2.png', 'flowerbed3.png']
        },
        backgrounds: [
            'url("garden-bg1.jpg")',
            'url("garden-bg2.jpg")',
            'url("garden-bg3.jpg")'
        ]
    },
    'living-room': {
        items: {
            sofa: ['sofa1.png', 'sofa2.png', 'sofa3.png'],
            tv: ['tv1.png', 'tv2.png', 'tv3.png'],
            'coffee-table': ['coffee-table1.png', 'coffee-table2.png', 'coffee-table3.png'],
            rug: ['rug1.png', 'rug2.png', 'rug3.png']
        },
        backgrounds: [
            'url("living-room-bg1.jpg")',
            'url("living-room-bg2.jpg")',
            'url("living-room-bg3.jpg")'
        ]
    }
};

let currentRoom = null;
let currentBackgroundIndex = 0;
let droppedItems = [];
let currentlyDragging = null;
let offsetX = 0, offsetY = 0;

function navigateTo(room) {
    currentRoom = room;
    currentBackgroundIndex = 0;
    document.getElementById('menu-page').style.display = 'none';
    document.getElementById('room-page').style.display = 'block';
    document.getElementById('room-title').innerText = room.charAt(0).toUpperCase() + room.slice(1);

    const roomContainer = document.getElementById('room');
    roomContainer.style.backgroundImage = rooms[room].backgrounds[currentBackgroundIndex];
    roomContainer.innerHTML = ''; // Clear any existing furniture
    droppedItems = []; // Reset the dropped items array

    displayFurnitureStyles(room);
}

function displayFurnitureStyles(room) {
    const furnitureStyles = document.getElementById('furniture-styles');
    furnitureStyles.innerHTML = '';

    for (const [item, styles] of Object.entries(rooms[room].items)) {
        styles.forEach(style => {
            const div = document.createElement('div');
            div.className = 'furniture-style';
            div.style.backgroundImage = `url('${style}')`;
            div.draggable = true;
            div.addEventListener('dragstart', (e) => dragStart(e, style));
            furnitureStyles.appendChild(div);
        });
    }
}

function dragStart(event, image) {
    event.dataTransfer.setData('text/plain', image);
    event.dataTransfer.setData('source', event.target.classList.contains('item') ? 'room' : 'list');
    currentlyDragging = event.target; // Track the currently dragged item

    // Calculate the offset between the mouse cursor and the top-left corner of the item
    const rect = currentlyDragging.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
}

const room = document.getElementById('room');
room.addEventListener('dragover', dragOver);
room.addEventListener('drop', drop);

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    const source = event.dataTransfer.getData('source');
    const room = document.getElementById('room');

    if (source === 'list') {
        // If the item is dragged from the list, create a new furniture item
        const newItem = document.createElement('div');
        newItem.className = 'item';
        newItem.style.backgroundImage = `url('${data}')`;
        newItem.style.position = 'absolute';
        newItem.style.left = `${event.clientX - room.getBoundingClientRect().left - offsetX}px`; // Adjust for offset
        newItem.style.top = `${event.clientY - room.getBoundingClientRect().top - offsetY}px`; // Adjust for offset
        newItem.style.width = '80px'; // Initial width
        newItem.style.height = '80px'; // Initial height
        newItem.draggable = true;
        newItem.addEventListener('dragstart', (e) => dragStart(e, data));

        // Add a resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        newItem.appendChild(resizeHandle);

        // Make the item resizable
        makeResizable(newItem, resizeHandle);

        room.appendChild(newItem);
        droppedItems.push(newItem); // Add the new item to the droppedItems array
    } else if (source === 'room') {
        // If the item is dragged within the room, update its position
        if (currentlyDragging) {
            currentlyDragging.style.left = `${event.clientX - room.getBoundingClientRect().left - offsetX}px`; // Adjust for offset
            currentlyDragging.style.top = `${event.clientY - room.getBoundingClientRect().top - offsetY}px`; // Adjust for offset
        }
    }
    currentlyDragging = null; // Reset the currently dragged item
}

function makeResizable(item, handle) {
    let startX, startY, startWidth, startHeight;

    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(item).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(item).height, 10);

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);
        item.style.width = `${newWidth}px`;
        item.style.height = `${newHeight}px`;
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

function changeBackground(direction) {
    const roomContainer = document.getElementById('room');
    currentBackgroundIndex = (currentBackgroundIndex + direction + rooms[currentRoom].backgrounds.length) % rooms[currentRoom].backgrounds.length;
    roomContainer.style.backgroundImage = rooms[currentRoom].backgrounds[currentBackgroundIndex];
}

function goBack() {
    document.getElementById('room-page').style.display = 'none';
    document.getElementById('menu-page').style.display = 'block';
    currentRoom = null;
}

function undo() {
    if (droppedItems.length > 0) {
        const lastItem = droppedItems.pop(); // Remove the last item from the array
        lastItem.remove(); // Remove the item from the DOM
    }
}

function saveRoom() {
    html2canvas(document.getElementById('room')).then(canvas => {
        // Create a link element
        const link = document.createElement('a');
        link.download = 'room-design.png'; // Set the filename for the downloaded image
        link.href = canvas.toDataURL(); // Convert the canvas to a data URL
        link.click(); // Trigger the download
    });
}