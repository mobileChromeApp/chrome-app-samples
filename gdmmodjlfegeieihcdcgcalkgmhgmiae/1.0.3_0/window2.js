var s_naclModule = null;
var s_gameDiv = null;
var s_Width = null;
var s_Height = null;
var s_fullScreen = 0;
var socket = null;
var s_debug = null;
// Indicate success when the NaCl module has loaded.
function moduleDidLoad() {
	console.log('moduleDidLoad');
	s_naclModule = document.getElementById('game');
}

function isValidIP(ip)
{
	var parts = ip.split('.');
	if(parts.length != 4)
		return false;
	var val = parseInt(parts[0]);
	if(val == 127 || val == 0)
		return false;
	if(val & 0xe0 == 0xe0)
		return false;
	return true;
}

function startsWith(s, prefix)
{
	// indexOf would search the entire string, lastIndexOf(p, 0) only checks at
	// the first index. See: http://stackoverflow.com/a/4579228
	return s.lastIndexOf(prefix, 0) === 0;
}

function InitSocket()
{
	try
	{
		socket = chrome.socket || chrome.experimental.socket;
	}
	catch(ex)
	{
		socket = null;
	}
}

function SocketCreate(type)
{
	var id = arguments[1];
	if(socket == null)
	{
		console.log('SocketCreate exception:'); 
		var msg = id + ':' + '-1';
		sendJNIMessage(msg);
		return;
	}
	try
	{
		socket.create(type, {}, function(createInfo) {
			var msg = id + ':' + createInfo.socketId;
			sendJNIMessage(msg);
			return;
		});
	}
	catch(ex)
	{
		var msg = id + ':' + '-1';
		sendJNIMessage(msg);
	}
	
}
function SocketClose(socketId)
{
	var id = arguments[1];
	if(socket == null)
	{
		console.log('SocketClose exception:'); 
		return;
	}
	if(s_debug != null)
		console.log('SocketClose id:' + socketId); 
	
	socket.disconnect(parseInt(socketId));
	socket.destroy(parseInt(socketId));
}

function SocketConnect(socketId)
{
	var name = arguments[1];
	var port = parseInt(arguments[2]);
	var id = arguments[3];
	if(socket == null)
	{
		console.log('SocketConnect exception:'); 
		var msg = id + ':' + '-1';
		sendJNIMessage(msg);
		return;
	}
	if(s_debug != null)
		console.log('SocketConnect id:' + socketId); 
	
	try
	{
		socket.connect(parseInt(socketId), name, port, function(sInfo) {
			var msg = id + ':' + socketId + ":" + '0';
			sendJNIMessage(msg);
			return;
		});
	}
	catch(ex)
	{
		var msg = id + ':' + '-1';
		sendJNIMessage(msg);
	}
}

function SocketRead(socketId)
{
	var len = parseInt(arguments[1]);
	var id = arguments[2];
	if(socket == null)
	{
		console.log('SocketRead exception:'); 
		var msg = id + ':' + '-1';
		sendJNIMessage(msg);
		return;
	}
	if(s_debug != null)
		console.log('SocketRead id:' + socketId); 
	try
	{
		socket.read(parseInt(socketId), len, function(readInfo)
		{
			if(readInfo.resultCode > 0)
			{
				var msg = id + ':' + socketId + ":";
				sendJNIArrayMessage(msg, readInfo.data);
				return;
			}
			var msg = id + ':' + '-1';
			if(s_debug != null)
				console.log('SocketRead failed:' + readInfo.resultCode); 

			sendJNIMessage(msg);
		});
	}
	catch(ex)
	{
		var msg = id + ':' + '-1';
		if(s_debug != null)
			console.log('SocketRead exception:'); 
		sendJNIMessage(msg);
	}
}
function SocketWrite(socketId)
{
	var id = parseInt(arguments[1]);
	var data = arguments[2];
	if(socket == null)
	{
		console.log('SocketWrite exception:'); 
		var msg = id + ':' + '-1';
		sendJNIMessage(msg);
		return;
	}
	if(s_debug != null)
		console.log('SocketWrite id:' + socketId); 
	
	try{
		socket.write(parseInt(socketId), data, function(writeInfo)
		{
			var msg = id + ':' + socketId + ":" + writeInfo.bytesWritten;
			sendJNIMessage(msg);
			return;
		});
	}
	catch(ex)
	{
		var msg = id + ':' + '-1';
		sendJNIMessage(msg);
	}
}

function GetHostByName(name)
{
	var id = arguments[1];
	if(socket == null)
	{
		console.log('GetHostByName exception:' + ex); 
		var msg = id + ':' + '-1';
		sendJNIMessage(msg);
		return;
	}

	if(startsWith(name, 'myip'))
	{
		socket.getNetworkList(function(iface)
		{
			if (iface)
			{
				for (var i=0; i<iface.length; i++)
				{
					if(isValidIP(iface[i].address))
					//if(startsWith(iface[i].address, '192'))
					{
						var msg = id + ':' + iface[i].address;
						sendJNIMessage(msg);
						return;
					}
				}
			}
			var msg = id + ':' + '-1';
			sendJNIMessage(msg);
		});

	}
	else
	{
		try
		{
			socket.create('tcp', {}, function(createInfo) {
				socket.connect(createInfo.socketId, name, 80, function(sInfo) {
					socket.getInfo(createInfo.socketId, function (sInfo2) {
					var msg = id + ':' + sInfo2.peerAddress;
					sendJNIMessage(msg);
					socket.disconnect(createInfo.socketId);
					socket.destroy(createInfo.socketId);
					return;
					
					});
				
				});
			});
		}
		catch(ex)
		{
			console.log('Gethostname exception:' + ex); 
			var msg = id + ':' + '-1';
			sendJNIMessage(msg);
		}
	
	}
}

function InitGame(arg)
{
	try
	{
		var loading = document.getElementById('loading');
		var header = document.getElementById('header');
		if(loading != null)
			loading.style.display = 'none';
		if(header != null)
			header.style.display = 'none';
	}
	catch(ex)
	{
		console.log('InitGame exception:' + ex); 
	}
	s_gameDiv.style.display = 'block';
	resizeGame();
}

function loadGame() {
	navigator.webkitPersistentStorage.requestQuota(1024*1024, function(bytes)
	{
		s_gameDiv = document.getElementById('game');
		//resizeGame();
		s_Height = 8;
		s_Width = 8;
		
		startGame();
		s_gameDiv.style.display = 'block';
		
		//InitGame(NULL);
//		GetHostByName('connect.polarbit.com');

	},function(e)
	{ 
		alert('Failed to allocate space') 
	});
	
}
function startGame()
{
	InitSocket();
	var nacl = document.createElement('embed');
	nacl.setAttribute('name', 'nacl_module');
	nacl.setAttribute('id', 'game1');
	nacl.setAttribute('width', s_Width);
	nacl.setAttribute('height', s_Height);
	nacl.setAttribute('src', 'game1.nmf');
	nacl.setAttribute('type', 'application/x-nacl');

	document.getElementById('game').innerHTML = '';
	document.getElementById('game').appendChild(nacl);
	s_naclModule = nacl;//document.getElementById('game');
	
/*	
function buildArrayBuffer(callback) {
  var blobBuilder = new BlobBuilder();
  for (var i = 1; i < arguments.length; ++i) {
    blobBuilder.append(arguments[i]);
  }

  var fileReader = new FileReader();
  fileReader.onload = function(e) {
    callback(e.target.result);
  };
  fileReader.readAsArrayBuffer(blobBuilder.getBlob());
}
*/
}

function resizeGame()
{
	s_Height = 480;
	s_Width = 854;
	s_Width = window.innerWidth;
	var aspect = 480/800;
	s_Height = s_Width*aspect;
	if(s_Height > window.innerHeight)
	{
		s_Height = window.innerHeight;
		s_Width = s_Height * 1.0/aspect;
		if(s_Width < window.innerWidth)
		{
			s_Width = s_Height * 1.0/0.50;
			if(s_Width > window.innerWidth)
			{
				s_Width = window.innerWidth;
			}
		}
	}
	//s_Width = s_Height*4/3;		

	if(s_naclModule != null)
	{
	
		if(s_fullScreen)
		{
			s_Height = window.innerHeight;
			s_Width = window.innerWidth;
		}

		s_naclModule.height = s_Height;
		s_naclModule.width = s_Width;
	}
}

var kMaxArraySize = 20;
var messageArray = new Array();

function String2Array(str)
{
	var buffer = new ArrayBuffer(str.length);
	var bytes = new Uint8Array(buffer);
	//var bytes = [];
	for (var i = 0; i < str.length; ++i)
	{
		bytes[i] = str.charCodeAt(i);
	}
	return buffer;
}

function handleMessage(message_event)
{
	if (typeof message_event.data == 'string')
	{
		var msg = message_event.data;
		if (startsWith(msg, 'JNI:'))
		{
			parseMessage(msg);
			//GetHostByName("myip");
			if(s_debug != null)
				console.log("java " + msg);
		}
		else
		{
			console.log(msg);
		}
		return;
	}
	else if (message_event.data != null)
	{
		var tmp = new Uint8Array(message_event.data);
		if(tmp[0] == 74 && tmp[1] == 78 && tmp[2] == 73 && tmp[3] == 58)
		{
			parseArrayMessage(message_event.data);
		}
	}
/*
	var bb = new BlobBuilder();
	bb.append(message_event.data);
	var blob = bb.getBlob();
  arrayBufferToString(blob.webkitSlice(0, 1), function(index) {
    store.save(game_id_, index, blob.webkitSlice(1));
  });
*/
}

function concatArrays(a1, a2)
{
	var tmp = new Uint8Array( a1.byteLength + a2.byteLength );
	tmp.set( new Uint8Array( a1 ), 0 );
	tmp.set( new Uint8Array( a2 ), a1.byteLength );
	return tmp.buffer;
}

function sendJNIArrayMessage(message, a2)
{
	var msg = 'JNI:';
	msg += message;
		
		
	var a1 = String2Array(msg);
	var a12 = concatArrays(a1, a2);
	if(s_naclModule != null)
		s_naclModule.postMessage(a12);
	
}

function sendJNIMessage(message)
{
	var msg = 'JNI:';
	msg += message;
	if(s_debug != null)
		console.log(msg);
	if(s_naclModule != null)
		s_naclModule.postMessage(msg);
	
}

function makeCall(func) {
  var message = func;
  for (var i = 1; i < arguments.length; ++i) {
    message += '\1' + arguments[i];
  }

  return message;
}

// Called by the common.js module.
function parseMessage(msg) {
	var params = msg.split(':');
	var jnifunc = window[params[1]];

	
	
	if (!jnifunc)
	{
		console.log('Error: Bad message received from NaCl module.');
		return;
	}

	var args = [];
    for(var i = 2; i < params.length; i++)
    {
        args.push(params[i]);
    }
	jnifunc.apply(null, args);
}

function parseArrayMessage(_msg) {
	var msg = new Uint8Array(_msg);
	var len = msg.byteLength;
	if(len > 64)
		len = 64;
	var strmsg = new Uint8Array(_msg.slice(0,len));

	var str = String.fromCharCode.apply(null, strmsg)
	var params = str.split(':');
	var jnifunc = window[params[1]];
	var arrayLen = parseInt(params[2]);
	var msgArray = new Uint8Array(_msg.slice(msg.byteLength-arrayLen, msg.byteLength));
	
	if (!jnifunc)
	{
		console.log('Error: Bad message received from NaCl module.');
		return;
	}
	if(s_debug != null)
		console.log(str);

	var args = [];
	args.push(params[3]);
	args.push(params[4]);
/*	
    for(var i = 3; i < params.length; i++)
    {
        args.push(params[i]);
    }
*/
	args.push(_msg.slice(msg.byteLength-arrayLen, msg.byteLength));
	jnifunc.apply(null, args);
}

document.addEventListener('DOMContentLoaded', function ()
{
    //document.body.webkitRequestFullscreen();
	document.addEventListener('resize', resizeGame, true);
	document.addEventListener('message', handleMessage, true);
    document.addEventListener("fullscreenchange", function() {
        resizeGame();
    }, false);
	/*
	chrome.socket.getNetworkList(function(iface)
	{
		if (iface)
		{
			for (var i=0; i<iface.length; i++)
			{
				console.log('addr:' + iface[i].address + ' name:' + iface[i].name);
			}
		}
	}); 
	*/
     document.addEventListener("keydown", function(event) {
        if(event.keyCode == 122 || event.keyCode == 48)
		{
			//var DaElement = document.getElementById('game');
            s_fullScreen ^= 1;
			if(s_fullScreen != 0)
			{
				s_naclModule.webkitRequestFullscreen();
			}
			else
			{
				document.webkitExitFullscreen();
			}

        }
    }, false);
});		

window.onload = loadGame;
window.onresize = resizeGame;


document.onwebkitfullscreenchange = function ()
{
	s_fullScreen = 1;
}

document.onwebkitfullscreenerror = function ()
{
	s_fullScreen = 0;
}

