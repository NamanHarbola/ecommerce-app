import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

const makeAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        if (!email) return;

        let user = await User.findOne({ email });

        // User hasn't logged in yet — skip silently
        if (!user) {
            console.log("Admin user not found in DB yet. Login first, then restart server.");
            return;
        }

        // One-time fix: patch missing clerkId
        if (!user.clerkId) {
            const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [email] });
            if (clerkUsers.data.length > 0) {
                const clerkId = clerkUsers.data[0].id;
                user = await User.findOneAndUpdate({ email }, { clerkId }, { returnDocument: 'after' }) as any;
                console.log("Patched missing clerkId:", clerkId);
            } else {
                console.warn("Could not find user in Clerk — skipping metadata update.");
                return;
            }
        }

        // Only promote if not already admin
        if (user!.role !== "admin") {
            await User.findOneAndUpdate({ email }, { role: "admin" });
        }

        await clerkClient.users.updateUserMetadata(user!.clerkId as string, {
            publicMetadata: { role: "admin" },
        });

        console.log("Admin promotion successful.");
    } catch (err: any) {
        console.error("Admin promotion failed:", err.message);
    }
};

export default makeAdmin;