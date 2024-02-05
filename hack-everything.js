/** @param {NS} ns **/
export async function main(ns) {
    const target = ns.args[0] || ns.getHostname(); // Get the target server from arguments or use the current server
    const depth = parseInt(ns.args[1]) || 0; // Current recursion depth
    const maxDepth = 5; // Maximum recursion depth to prevent infinite recursion
    const scriptName = ns.getScriptName();
    const visitedMarker = "visited.txt"; // A marker file to indicate a server has been visited

    // Stop spreading if the maximum depth is reached
    if (depth > maxDepth) return;

    // Attempt to hack the current target
    if (target !== "home" && !ns.fileExists(visitedMarker, target)) {
        // Mark the server as visited to avoid future attempts
        await ns.write(visitedMarker, "", "w");
        await ns.hack(target);

        // Propagate the script to neighboring servers
        const neighbors = ns.scan(target);
        for (const neighbor of neighbors) {
            if (!ns.fileExists(visitedMarker, neighbor)) {
                if (tryNuke(ns, neighbor)) {
                    await ns.scp([scriptName, visitedMarker], neighbor);
                    ns.exec(scriptName, neighbor, 1, neighbor, depth + 1);
                }
            }
        }
    }
}

/** @param {NS} ns **/
function tryNuke(ns, target) {
    if (ns.hasRootAccess(target)) return true; // Already have root access

    let openedPorts = 0;
    const programs = [
        { name: "BruteSSH.exe", func: ns.brutessh },
        { name: "FTPCrack.exe", func: ns.ftpcrack },
        { name: "relaySMTP.exe", func: ns.relaysmtp },
        { name: "HTTPWorm.exe", func: ns.httpworm },
        { name: "SQLInject.exe", func: ns.sqlinject }
    ];

    // Try to run each port-opening program
    for (const program of programs) {
        if (ns.fileExists(program.name, "home")) {
            program.func(target);
            openedPorts++;
        }
    }

    // Nuke the server if enough ports are opened
    if (openedPorts >= ns.getServerNumPortsRequired(target)) {
        ns.nuke(target);
        return true;
    }

    return false;
}
