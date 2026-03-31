import time

print("Smart Traffic System")

r1=int(input("Road1: "))
r2=int(input("Road2: "))
r3=int(input("Road3: "))
r4=int(input("Road4: "))

roads=[("R1",r1),("R2",r2),("R3",r3),("R4",r4)]
roads.sort(key=lambda x:x[1],reverse=True)

for r,v in roads:
    print(f"{r} GREEN {v*2}s")
    time.sleep(1)
    print(f"{r} RED")

print("Emergency: Road1 Priority")