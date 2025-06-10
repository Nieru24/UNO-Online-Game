"use client";
import React, { useState } from "react";

interface MessageProps {
    gameOnGoing: boolean;
}

const TopDisplay: React.FC<MessageProps> = ({
    gameOnGoing,
}) => (

    <div className="flex w-[360px] h-full justify-center items-center p-4">
        {gameOnGoing === true && (
            <div className="flex flex-col justify-center items-center w-full h-full border-2 border-solid border-[#928E8F] bg-[#171717] opacity-100">
                <div>Chat</div>
                <div>Someday, soon!</div>
            </div>
        )}
    </div>
);

export default TopDisplay;