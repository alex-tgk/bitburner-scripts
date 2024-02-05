/** @param {NS} ns **/
export async function main(ns) {
    const scriptToSpread = "growHackLoop.js";
    const visitedMarker = "visited.txt";
    await propagate(ns, "home", scriptToSpread, visitedMarker, 0);
}

async function propagate(ns, currentServer, scriptName, visitedMarker, depth) {
    const maxDepth = 10; // Prevents infinite recursion
    if (depth > maxDepth) return;

    const neighbors = ns.scan(currentServer);
    for (const neighbor of neighbors) {
        if (neighbor === "home" || ns.fileExists(visitedMarker, neighbor)) continue;
        if (tryNuke(ns, neighbor)) {
            await ns.scp(scriptName, neighbor);
            await ns.scp(visitedMarker, neighbor);
            ns.exec(scriptName, neighbor, 1); // Run grow-hack loop on the neighbor
            await ns.write(visitedMarker, "", "w", neighbor); // Mark as visited
            await propagate(ns, neighbor, scriptName, visitedMarker, depth + 1); // Recurse
        }
    }
}

function tryNuke(ns, target) {
    if (ns.hasRootAccess(target)) return true; // Already have root access

    // Attempt to open ports and nuke the server
    const programs = [
        { name: "BruteSSH.exe", func: ns.brutessh },
        { name: "FTPCrack.exe", func: ns.ftpcrack },
        { name: "relaySMTP.exe", func: ns.relaysmtp },
        { name: "HTTPWorm.exe", func: ns.httpworm },
        { name: "SQLInject.exe", func: ns.sqlinject }
    ];
    for (const program of programs) {
        if (ns.fileExists(program.name, "home")) {
            program.func(target);
        }
    }
    if (ns.getServerNumPortsRequired(target) <= programs.filter(p => ns.fileExists(p.name, "home")).length) {
        ns.nuke(target);
        return true;
    }
    return false;
}
