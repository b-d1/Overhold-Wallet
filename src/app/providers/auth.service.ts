import { Injectable } from '@angular/core';
import { createHash } from 'crypto';
import { SharedService } from './shared.service';
import { MessagingService } from './messaging.service';
import { mqMessages } from '../enums/common';

const bip39 = require('bip39');

@Injectable()
export class AuthService {

    constructor(private messagingService: MessagingService) { }

    isValidPassword(password: string): boolean {
        if (!password) {
            throw new Error('Invalid password');
        } else {
            return true;
        }
    }

    getPasswordHash(password: string): string {
        return createHash('sha256').update(password).digest('hex');
    }

    /**
     * Logins a user.
     * @param username username of the user.
     * @param passwordPlain password of the user.
     * @returns {Promise<boolean>} resolves whether login is successful or not
     */
    login(username: string, passwordPlain: string) {
        this.messagingService.sendMessage({ type: mqMessages.SignInUser, username: username, password: passwordPlain });
    }

    /**
     * Registers a user.
     * @param username username of the user.
     * @param passwordPlain password of the user, not shorter than 6 characters.
     * @param confirmPasswordPlain re-entered password, must match the previous one.
     * @returns {Promise<boolean} resolves whether register is successful or not.
     */
    register(username: string, passwordPlain: string, confirmPasswordPlain: string) {
        // this.messagingService.sendMessage(
        //     { type: mqMessages.SignUpUser, username: username, password: passwordPlain, confirmPassword: confirmPasswordPlain }
        // );

        this.messagingService.checkIfUserExists(
            {  type: mqMessages.SignUpUser, username: username, password: passwordPlain, confirmPassword: confirmPasswordPlain }
        );

    }

    /**
     * Logout a user.
     * @param username username of the user.
     * @returns {Promise<boolean} resolves whether register is successful or not.
    */
    logout() {
        this.messagingService.sendMessage({ type: mqMessages.LogoutUser });
    }
}
