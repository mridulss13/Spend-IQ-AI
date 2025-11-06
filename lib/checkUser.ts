import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
export const checkUser = async ()=>{
    const user = await currentUser();

    if(!user){
        return null;
    }
    
    const loggedInuser = await db.user.findUnique({
       where:{
        clerkUserId: user.id,
       }, 
    });

    if(loggedInuser){
        return loggedInuser;
    }
    
    // Get email - required field, must be present
    const email = user.emailAddresses[0]?.emailAddress;
    if(!email){
        throw new Error("User email is required but not available");
    }

    // Construct name - handle null/undefined values
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const name = `${firstName} ${lastName}`.trim() || null;

    const newUser = await db.user.create({
        data:{
            clerkUserId: user.id,
            name: name,
            imageUrl: user.imageUrl || null,
            email: email,
        },
    });
 return newUser;
}