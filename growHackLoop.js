/** @param {NS} ns **/
export async function main(ns) {
    const target = ns.getHostname(); // Assumes this script runs on the target server

    while (true) {
        await ns.hack(target); // Try to hack first to free up money
        await ns.grow(target); // Then grow the amount of money available on the server
    }
}
