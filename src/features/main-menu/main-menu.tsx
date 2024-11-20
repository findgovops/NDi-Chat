"use client";

import { MenuTrayToggle } from "@/features/main-menu/menu-tray-toggle";
import {
  Menu,
  MenuBar,
  MenuItem,
  MenuItemContainer,
  menuIconProps,
} from "@/ui/menu";
import {
  Book,
  Home,
  MessageCircle,
  PaintBucket,
  Sheet,
  VenetianMask,
  BookOpenText,
  Shield
} from "lucide-react";
import { getCurrentUser } from "../auth-page/helpers";
import { MenuLink } from "./menu-link";
import { UserProfile } from "./user-profile";
import { useSession } from "next-auth/react";


export const MainMenu = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  
  return (
    <Menu>
      <MenuBar>
        <MenuItemContainer>
          <MenuTrayToggle />
        </MenuItemContainer>
        <MenuItemContainer>
          <MenuItem tooltip="Chat">
            <MenuLink href="/chat" ariaLabel="Go to the Chat page">
              <MessageCircle {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuItem tooltip="Persona">
            <MenuLink href="/persona" ariaLabel="Go to the Persona configuration page">
              <VenetianMask {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuItem tooltip="extensions">
            <MenuLink href="/extensions" ariaLabel="Go to the Extensions configuration page">
              <PaintBucket {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuItem tooltip="prompts">
            <MenuLink href="/prompt" ariaLabel="Go to the Prompt Library configuration page">
              <Book {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          <MenuItem tooltip="guidance">
            <MenuLink href="/guidance" ariaLabel="Go to the Guidance page">
              <BookOpenText {...menuIconProps} />
            </MenuLink>
          </MenuItem>
          {isAdmin && (
            <MenuItem tooltip="admin">
              <MenuLink href="/admin" ariaLabel="Go to the Admin Portal">
                <Shield {...menuIconProps} />
              </MenuLink>
            </MenuItem>
          )}
          {isAdmin && (
            <>
              <MenuItem tooltip="reporting">
                <MenuLink href="/reporting" ariaLabel="Go to the Admin reporting" >
                  <Sheet {...menuIconProps} />
                </MenuLink>
              </MenuItem>
            </>
          )}
        </MenuItemContainer>
        <MenuItemContainer>
          <MenuItem tooltip="Profile">
            <UserProfile />
          </MenuItem>
        </MenuItemContainer>
      </MenuBar>
    </Menu>
  );
};
