// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';



let _context:vscode.ExtensionContext;
let _statusBarItem:vscode.StatusBarItem;


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	_context=context;
	
	
	var isInstalled=await isColorInspectorInstalled();
	if(!isInstalled){
		vscode.window.showErrorMessage("Please install Color Inspector & Palettes from Microsoft Store");
	}

	
	let commandId='extension.launch-color-inspector';
	let commandToken = vscode.commands.registerCommand(commandId, async() => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//vscode.window.showInformationMessage('launching color inspector');
		await launchColorInspector();
		
	});
	_context.subscriptions.push(commandToken);


	_statusBarItem=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 48);
	_statusBarItem.command=commandId;
	_context.subscriptions.push(_statusBarItem);
	
	
	updateStatusBarItem();
}




function updateStatusBarItem() {

	_statusBarItem.tooltip="Inspect color on screen";
	_statusBarItem.text="$(telescope)";
	_statusBarItem.show();

}


async function isColorInspectorInstalled() {
	return new Promise((resolve)=>{
		child_process.exec("powershell -Command Get-AppxPackage 25510Hereafter2.ColorInspectorPalettes", (err, stdout, stderr)=>{			
			resolve(stdout!==null && stdout.length>0);
		});
	});
}


async function launchColorInspector() {
	
	//
	var folder=_context.globalStoragePath;

	try{
		fs.mkdirSync(folder);
	}catch{}

	var file=path.join(folder as string, ".color.txt");

	//
	try {
		if(fs.existsSync(file)) {
			fs.unlinkSync(file);
		}
	} catch { }
	var uri=vscode.Uri.parse("color-inspector://inspect?file="+file);
	
	var result=await vscode.env.openExternal(uri);
	console.log(result);
	

	while(!fs.existsSync(file)){		
		await sleepAsync(300);
	}

	var text=fs.readFileSync(file, 'utf8');
	//

	let editor=vscode.window.activeTextEditor;
	if(editor) {		
		let selection=editor.selection;	

		editor.edit((builder)=>{
			builder.replace(selection, text);
		});
	}
}

function sleepAsync(ms:number){
	return new Promise((resolve)=>{
		setTimeout(resolve, ms);
	});
}


// this method is called when your extension is deactivated
export function deactivate() {}
